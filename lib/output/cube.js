/*
 * Cube compatible interface
 */

var redis = require('redis'),
    path = require('path'),
    url = require('url');

function buildFilter(path) {
    //[FIXME] very naive implementation, raise some errors
    return RegExp(path.replace(/\*/, '\\w*'));
}

var Cube = function(state, router, opts) {
    this.client = redis.createClient(); // [FIXME] some opts?
    this.client.on('error', function(err) {
        console.warn('[redis error]', err);
    });
    this.keys = {};
    if (opts === undefined)
        opts = {};
    if (opts.path === undefined)
        this.path = '/tmp/';
    else
        this.path = opts.path;
    var that = this;
    state.on('set', function(key, value) {
        that.set(key, value);
    });
    router.route(/^\/1\.0\/metric/, function(req, res) {
        res.writeHead(200, {'Content-Type': 'application/json'});
        var args = url.parse(req.url, true).query;
        var start, stop, step, limit;
        if (args.start === undefined)
            start = 0;
        else {
            if (args.start[0] == '-') {
                start = Date.now() + parseInt(args.start, 10);
            } else {
                start = parseInt(Date.parse(args.start).getTime() / 1000, 10);
            }
        }
        if (args.stop === undefined)
            stop = parseInt(Date.now(), 10);
        else
            stop = parseInt(Date.parse(args.stop).getTime() / 1000, 10);
        if (args.limit === undefined)
            limit = 10000;
        else
            limit = args.limit;
        console.log(args.step);
        if (args.step === undefined)
            step = 60;
        else
            step = parseInt(args.step, 10);
        that.get(args.expression, start, stop, step, function(err, results) {
            res.end(JSON.stringify(results));
        });
    });
};

Cube.prototype.findKey = function(path) {
    var q, r;
    q = buildFilter(path);
    r = [];
    for (var key in this.keys) {
        if (q.test(key)) {
            r.push(key);
        }
    }
    return r;
};

Cube.prototype.get = function(expression, from, to, step, cb) {
    var q = new Query(expression);
    this.client.zrangebyscore(q.path[0], from, to, 'WITHSCORES',
            function(err, values) {
        if (err) throw err;
        var buff = [];
        var results = [];
        var s = 0;
        var last, score, value = null;
        for (var i = 0; i < values.length; i++) {
            if (value == null) {
                value = parseInt(values[i], 10);
            } else {
                score = parseInt(values[i], 10);
                if (last == null) {
                    last = score;
                }
                if ((score - last) > step) {
                    results.push(q.filter()(buff));
                    last = score;
                    buff = [];
                } else {
                    buff.push(value);
                }
                score, value = null;
            }
        }
        cb(null, results);
    });
};

function unix_now() {
    return Math.floor(Date.now() / 1000);
}

Cube.prototype.set = function(key, value, cb) {
    this.client.zadd(key, unix_now(), value, function(err) {
        if (cb) cb(err);
    });
};

exports.Cube = Cube;

var Query = function(q) {
    //[TODO] peg or jison parsing?
    this.path = q.split(/\s+/);
    this.reduce = this.path.pop().toLowerCase();
};

Query.prototype.filter = function() {
    return Query._filter[this.reduce];
};

Query._filter = {};
Query._filter.min = function(values) {
    var value = values.pop();
    for (var i = 0; i < values.length; i++) {
        if (values[i] < value)
            value = values[i];
    }
    return value;
};
Query._filter.max = function(values) {
    var value = values.pop();
    for (var i = 0; i < values.length; i++) {
        if (values[i] > value)
            value = values[i];
    }
    return value;
};
Query._filter.median = function(values) {
    values.sort();
    return values[Math.floor(values.length / 2)];
};
Query._filter.mean = function(values) {
    var value = 0;
    for (var i = 0; i < values.length; i++) {
        value += values[i];
    }
    return value / values.length;
};

exports.register = function(state, router, opts, cb) {
    var c = new Cube(state, router, opts);
    if (cb) cb.call();
};

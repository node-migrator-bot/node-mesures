/*
 * Cube compatible interface
 */

var hoard = require('hoard'),
    path = require('path'),
    url = require('url');

function buildFilter(path) {
    //[FIXME] very naive implementation, raise some errors
    return RegExp(path.replace(/\*/, '\\w*'));
}

var Cube = function(state, router, opts) {
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
    router.route(/^\/1\.0\/metric/, this.onRequest);
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

Cube.prototype.onRequest = function(req, res) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    var args = url.parse(req.url);
    var expression, start, stop, step, limit;
    if (args.start === undefined)
        start = 0;
    else
        start = parseInt(Date.parse(args.start).getTime() / 1000, 10);
    if (args.stop === undefined)
        stop = parseInt(Date.now(), 10);
    else
        stop = parseInt(Date.parse(args.stop).getTime() / 1000, 10);
    if (args.limit === undefined)
        limit = 10000;
    else
        limit = args.limit;
};

Cube.prototype.get = function(expression, from, to, step, cb) {
    var q = new Query(expression);
    hoard.fetch(this.path + q.path[0], from, to,
            function(err, timeInfo, values) {
        if (err) throw err;
        var dbstep = timeInfo[2];
        var buff = [];
        var results = [];
        var s = 0;
        for (var i = 0; i < values.length; i++) {
            var value = values[i];
            s += dbstep;
            if (value != null) {
                buff.push(value);
            }
            if (s >= step) {
                results.push(q.filter()(buff));
                s = 0;
                buff = [];
            }
        }
        cb(null, results);
    });
};

Cube.prototype.set = function(key, value, cb) {
    if (this.keys[key] === undefined) {
        var that = this;
        path.exists(that.path + key, function(exists) {
            if (exists) {
                that.keys[key] = true;
                that.set(key, value, cb);
            } else {
                hoard.create(that.path + key, [[1, 60], [10, 600]], 0.5,
                    function(err) {
                    if (err) throw err;
                    that.keys[key] = true;
                    that.set(key, value, cb);
                });
            }
        });

    } else {
        hoard.update(this.path + key, value, parseInt(Date.now() / 1000, 10),
                function(err) {
            if (err) throw err;
            if (cb) cb.call();
        });
    }
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
    for(var i = 0; i < values.length; i++) {
        if (values[i] < value)
            value = values[i]
    }
    return value;
};
Query._filter.max = function(values) {
    var value = values.pop();
    for(var i = 0; i < values.length; i++) {
        if (values[i] > value)
            value = values[i]
    }
    return value;
};
Query._filter.median = function(values) {
    values.sort();
    return values[Math.floor(values.length/2)];
};
Query._filter.mean = function(values) {
    var value = 0;
    for(var i = 0; i < values.length; i++) {
        value += values[i];
    }
    return value / values.length;
};
exports.register = function(state, router, opts, cb) {
    var c = new Cube(state, router, opts);
    if (cb) cb.call();
};
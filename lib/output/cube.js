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

var Cube = function(state, router, opts, cb) {
    this.client = redis.createClient(); // [FIXME] some opts?
    this.client.on('error', function(err) {
        console.warn('[redis error]', err);
    });
    this.compact_tick = 2; // compact every n minutes
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
    var that = this;
    this.client.keys('*', function(err, values) {
        console.log('keys', JSON.stringify(values));
        that.keys = {};
        for (var i = 0; i < values.length; i++) {
            that.keys[values[i]] = true;
        }
        //[FIXME] compacting is broken
        //
        //that.compact();
        //setInterval(function(cube) {
            //cube.compact();
        //}, that.compact_tick * 60 * 1000, that);

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
                    start = parseInt(Date.parse(args.start).getTime() / 1000,
                        10);
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
            if (args.step === undefined)
                step = 60;
            else
                step = parseInt(args.step, 10);
            that.get(args.expression, start, stop, step,
                    function(err, first, results) {
                res.end(JSON.stringify({first: first, values: results}));
            });
        });
        if (cb) cb.call();
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

/*
 * values is a list [value, key, value, key …] as return by ZRANGEBYSCORE
 * step in second
 * filter compute the consolidated value
 */
var consolidate = function(values, step, filter) {
    var buff = [];
    var results = [];
    var score, value, next, start = null;
    for (var i = 0; i < values.length; i++) {
        if (value == null) {
            value = parseInt(values[i], 10);
        } else {
            score = parseInt(values[i], 10);
            if (next == null) {
                start = score;
                next = score + step;
            }
            if (score >= next) {
                results.push(filter(buff));
                next += step;
                buff = [];
            } else {
                buff.push(value);
            }
            score, value = null;
        }
    }
    return [start, results];
};

/**
 * cb = function(err, first tick, values)
 */
Cube.prototype.get = function(expression, from, to, step, cb) {
    var q = new Query(expression);
    this.client.zrangebyscore(q.path[0], from, to, 'WITHSCORES',
            function(err, values) {
        if (err) throw err;
        var score_value = consolidate(values, step, q.filter());
        cb(null, score_value[0], score_value[1]);
    });
};

function unix_now() {
    return Math.floor(Date.now() / 1000);
}

Cube.prototype.set = function(key, value, cb) {
    var that = this;
    this.client.zadd(key, unix_now(), value, function(err) {
        if (! err) that.keys[key] = true;
        if (cb) cb(err);
    });
};

Cube.prototype.compact = function(cb) {
    var before = unix_now() - this.compact_tick * 60;
    var that = this;
    var cpt = 0;
    for (k in this.keys) {
        cpt++;
        console.log('key', k);
        that.get(k + ' MEAN', 0, before, this.compact_tick * 60,
                function(err, first, values) {
                    console.log('k', k); //[FIXME] k seems to be broken
            that.client.zremrangebyscore(k, '-inf', before, function() {
                var m = that.client.multi();
                for (var i = 0; i < values.length; i++) {
                    var value = values[i];
                    if (typeof value === 'number') {
                        var tick = first + i * that.compact_tick;
                        m.zadd(k, tick, value); //[FIXME] value can be NaN ?!
                    }
                }
                m.exec(function(err, res) {
                    if (err) console.warn(err);
                    cpt--;
                    if (cpt == 0 && cb) cb.call();
                });
            });

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

//[FIXME] filter as iterator
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
    var c = new Cube(state, router, opts, cb);
};

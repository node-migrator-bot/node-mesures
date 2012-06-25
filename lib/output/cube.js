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

Cube.prototype.get = function(key, from, to, step, cb) {
    hoard.fetch(key, from, to, function(err, timeInfo, values) {
        if (err) throw err;
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
                    console.log('Cube for', key);
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

exports.register = function(state, router, opts, cb) {
    var c = new Cube(state, router, opts);
    if (cb) cb.call();
};

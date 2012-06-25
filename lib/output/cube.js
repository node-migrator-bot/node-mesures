/*
 * Cube compatible interface
 */

var hoard = require('hoard'),
    path = require('path');

var Cube = function(state, router, opts) {
    this.keys = {};
    if (opts.path === undefined)
        this.path = '/tmp/';
    else
        this.path = opts.path;
    var that = this;
    state.on('set', function(key, value) {
        that.set(key, value);
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
                hoard.create(that.path + key, [[1, 60], [10, 600]], 0.5, function(err) {
                    if (err) throw err;
                    console.log('Cube for', key);
                    that.keys[key] = true;
                    that.set(key, value, cb);
                });
            }
        });

    } else {
        hoard.update(this.path + key, value, parseInt(Date.now() / 1000, 10), function(err) {
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

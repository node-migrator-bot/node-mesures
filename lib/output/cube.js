/*
 * Cube compatible interface
 */

var hoard = require('hoard'),
    path = require('path');

var Cube = function(state, router) {
    this.keys = {};
    state.on('set', function(key, value) {
    });

};

Cube.prototype.set = function(key, value, cb) {
    if (this.keys[key] === undefined) {
        var that = this;
        path.exists(key, function(exists) {
            if (exists) {
                that.keys[key] = true;
                that.set(key, value, cb);
            } else {
                hoard.create(key, [[1, 60], [10, 600]], 0.5, function(err) {
                    if (err) throw err;
                    console.log('Cube for', key);
                    that.keys[key] = true;
                    that.set(key, value, cb);
                });
            }
        });

    } else {
        hoard.update(key, value, parseInt(Date.now() / 1000), function(err) {
            if (err) throw err;
            if (cb) cb.call();
        });
    }
};

exports.Cube = Cube;

exports.register = function(state, router, opts, cb) {

    if (cb) cb.call();
};

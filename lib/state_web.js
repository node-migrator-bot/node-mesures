/**
 * Expose states as a web page : static and server events.
 */

var fs = require('fs'),
    path = require('path'),
    statics = require('./statics.js');

exports.register = function(state, router, opts, cb) {
    statics.register(router);
    router.route(/^\/events/, function(req, res) {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no'});
        var write_event = function(evt) {
            res.write('data: ');
            res.write(evt);
            res.write('\r\n\r\n');
        };
        write_event(state.as_json());
        state.on('set', function(key, value) {
            var r = {};
            r[key] = value;
            write_event(JSON.stringify(r));
        });
        state.on('delete', function(key) {
            var r = {};
            r[key] = null;
            write_event(JSON.stringify(r));
        });
    });
    router.route(/^\/data/, function(req, res) {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(state.as_json());
    });
    if (opts.homepage) {
        router.route(/^\/$/, function(req, res) {
            fs.readFile(path.dirname(__filename) + '/../www/index.html',
                function(err, data) {
                    if (err) throw err;
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.end(data);
                });
        });
    }
    if (cb) cb.call();
};

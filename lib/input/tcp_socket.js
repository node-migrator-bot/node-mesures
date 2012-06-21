var net = require('net');
/*
 * A simple tcp socket with "key value\n" communication.
 */

var commands = {};

commands.set = function(args, c, state) {
    var value = parseInt(args[1], 10);
    state.set(args[0], value);
    c.end('+OK\r\n');
};

commands.delete = function(args, c, state) {
    state.delete(args[0]);
    c.end('+OK\r\n');
};

function register(state, router, opts, cb) {
    var port, host;
    port = opts.port;
    host = opts.host;
    var server = net.createServer(function(c) { //'connection' listener
        c.on('end', function() {
            console.log('server disconnected');
        });
        c.on('data', function(data) {
            var args = data.toString();
            args = args.substring(0, args.length - 1).split(' ');
            var action = args.shift().toLowerCase();
            var command = commands[action];
            if (command === undefined) {
                c.end('-Unknown action\r\n');
            } else {
                command(args, c, state);
            }
        });
    });
    server.listen(port, host, function() { //'listening' listener
        console.log('[plugin tcp_socket] listening', host, ':', port);
        if (cb) cb.call();
    });
    return server;
}

exports.register= register;

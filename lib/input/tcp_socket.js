var net = require('net');
/*
 * A simple tcp socket with "key value\n" communication.
 */
function register(state, router, opts, cb) {
    var port, host;
    port = opts.port;
    host = opts.host;
    var server = net.createServer(function(c) { //'connection' listener
        c.on('end', function() {
            console.log('server disconnected');
        });
        c.on('data', function(data) {
            //[FIXME] Handle bad messages
            var match = /(\w+) (\w+)\s?/.exec(data.toString());
            if (match !== null) {
                var v = match[2];
                var vv = parseInt(v, 10);
                if (! isNaN(vv)) v = vv;
                state.set(match[1], v);
                c.write('ok\n');
            } else {
                c.write('error\n');
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

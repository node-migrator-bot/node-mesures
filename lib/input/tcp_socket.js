var net = require('net');
/*
 * A simple tcp socket with "key value\n" communication.
 */
function register(state, router, opts, cb) {
    var port, host;
    port = opts[0];
    host = opts[1];
    var server = net.createServer(function(c) { //'connection' listener
        c.on('end', function() {
            console.log('server disconnected');
        });
        c.on('data', function(data) {
            var match = /(\w+) (\w+)\s?/.exec(data.toString());
            var v = match[2];
            var vv = parseInt(v, 10);
            if (! isNaN(vv)) v = vv;
            state.set(match[1], v);
        });
    });
    server.listen(port, host, function() { //'listening' listener
        console.log('server bound');
        if (cb)
            cb.call();
    });
    return server;
}

exports.register= register;

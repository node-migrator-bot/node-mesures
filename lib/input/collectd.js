var http = require('http');

function register(state, router, opts, cb) {
    console.log(opts);
    var server = http.createServer(function(req, res) {
        //[FIXME] handling login/password
        if (req.method === 'POST') {
            var data = '';
            req.on('data', function(chunk) {
                data += chunk;
            });
            req.on('end', function() {
                var datas = JSON.parse(data);
                for (var i = 0; i < datas.length; i++) {
                    //[FIXME] filter option to display only few values.
                    var d = datas[i];
                    var key = d.host + '.' + d.plugin + '.' + d.plugin_instance;
                    for (var j = 0; j < d.values.length; j++) {
                        state.set(key + '.' + d.dsnames[j], d.values[j]);
                    }
                }
                res.writeHead(201, {'Content-Type': 'text/plain'});
                res.end();
            });
        } else {
            res.writeHead(405);
            res.end();
        }
    });
    server.listen(opts.port, opts.host);
    if (cb) cb.call();
}

exports.register = register;

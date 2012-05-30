#!/usr/bin/env node
var http = require('http'),
    fs = require('fs'),
    Router = require('../lib/router').Router,
    State = require('../lib/state').State;

var state = new State();
state.setMaxListeners(200);

process.title = 'mesures';

var args = process.argv.slice(2);
var conf;

if (args.length) {
    conf = JSON.parse(fs.readFileSync(args[0]));
    console.log('Using config file : ', args[0]);
} else {
    conf = {
        host: 'localhost',
        port: 1337,
        plugins: {
            'input/tcp_socket': {port: 8124, host: 'localhost'},
            'state_web': [],
            'proc/stats': [],
            'output/vapor': []
        }
    };
}

console.log(conf);

var server = http.createServer();
var router = new Router(server);

server.listen(conf.port, conf.host);

var plugins = 0;
for (var plugin in conf.plugins) {
    console.log('[registering]', plugin);
    plugins += 1;
    var p = require('../lib/' + plugin);
    p.register(state, router, conf.plugins[plugin], function() {
        plugins -= 1;
        if (plugins == 0) {
            console.log('[registering] Done !');
        }
    });
}

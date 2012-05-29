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
        plugins: { // [TODO] named arguments
            'input/tcp_socket': [8124, 'localhost'],
            'state_web': [],
            'proc/stats': [],
            'output/vapor': []
        }
    };
}

var server = http.createServer();
var router = new Router(server);

server.listen(conf.port, conf.host);

// [TODO] counting registered plugins and trigger a "everybody is ready" call back.
for (var plugin in conf.plugins) {
    var p = require('../lib/' + plugin);
    p.register(state, router, conf.plugins[plugin]);
}

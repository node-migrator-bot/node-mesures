#!/usr/bin/env node
var http = require('http'),
    Router = require('../lib/router').Router,
    State = require('../lib/state').State;

var state = new State();
state.setMaxListeners(200);

process.title = 'metricsd';

var server = http.createServer();
var router = new Router(server);

server.listen(1337, "localhost");

var plugins = {
    "input/tcp_socket": [8124, "localhost"],
    "state_web": [],
    "proc/stats": [],
    "output/vapor": []
};

for (var plugin in plugins) {
    var p = require('../lib/' + plugin);
    p.register(state, router, plugins[plugin]);
}

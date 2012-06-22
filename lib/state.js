/*
 * Store states and throw events when modified.
 */
var events = require('events');
    util = require('util');

function State() {
    this.data = {};
}

util.inherits(State, events.EventEmitter);

State.prototype.set = function(key, value) {
    if (this.data[key] === undefined) {
        this.data[key] = {};
    }
    this.data[key].value = value;
    this.emit('set', key, value);
};

State.prototype.delete = function(key) {
    delete this.data[key];
    this.emit('delete', key);
};

State.prototype.get = function(key) {
    return this.data[key].value;
};

State.prototype.as_json = function() {
    var data = {};
    for (key in self.data) {
        data[key] = self.data[key].value;
    }
    return JSON.stringify(data);
};

exports.State = State;

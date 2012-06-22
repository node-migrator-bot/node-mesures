/*
 * Store states and throw events when modified.
 */
var events = require('events');
    util = require('util');

function State() {
    this.data = {};
}

function Value() {
    this.value = 0;
}

Value.prototype.close = function() {
    if (this.interval !== undefined) {
        clearInterval(this.interval);
    }
};

util.inherits(State, events.EventEmitter);

State.prototype.set = function(key, value) {
    if (this.data[key] === undefined) {
        this.data[key] = new Value();
    }
    this.data[key].value = value;
    this.emit('set', key, value);
};

State.prototype.delete = function(key) {
    this.data[key].close();
    delete this.data[key];
    this.emit('delete', key);
};

State.prototype.get = function(key) {
    return this.data[key].value;
};

State.prototype.flush = function(key) {
    this.set(key, this.data[key].incr);
    this.data[key].incr = 0;
};

State.prototype.incr = function(key, incr, interval) {
    if (this.data[key] === undefined) {
        if (interval === undefined) {
            interval = 60000;
        }
        var that = this;
        var v = new Value();
        v.incr = incr;
        v.interval = setInterval(function(state, key) {
                state.flush(key);
            }, interval, that, key);
        this.data[key] = v;
    } else {
        this.data[key].incr += incr;
    }
};

State.prototype.as_json = function() {
    var data = {};
    for (key in this.data) {
        data[key] = this.data[key].value;
    }
    return JSON.stringify(data);
};

exports.State = State;

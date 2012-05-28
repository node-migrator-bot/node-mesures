var EventSource = require('eventsource');

function register(state, router, opts, cb) {
    es = new EventSource(opts.url);
    es.onmessage = function(e) {
        var msg = JSON.parse(e.data);
        for (k in msg) {
            state.set(k, msg[k]);
        }
    };
    es.onerror = function() {
        console.log('ERROR!');
    };

}

exports.register = register;


function stats(state) {
    var mu = process.memoryUsage();
    state.set('self.rss', Math.round(mu.rss / 1024));
    state.set('self.heapTotal', Math.round(mu.heapTotal / 1024));
    state.set('self.heapUsed', Math.round(mu.heapUsed / 1024));
}

function register(state, router, opts, cb) {
    var interval;
    if (opts.interval === undefined) {
        interval = 10000;
    } else {
        interval = opts.interval;
    }
    setInterval(function() {
        stats(state);
    }, interval);
    stats(state);
    if (cb) cb.call();
}

exports.register = register;

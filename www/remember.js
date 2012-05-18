var remember = {};

/**
 * A container to handle not so old values.
 * @author Mathieu Lecarme
 * @this {Remember}
 * @param {number} howlong The time to keep values (in ms).
 */
remember.Remember = function(howlong) {
    this.howlong = howlong;
    this.values = {};
    this.timestamps = [];
};

/**
 * Add a value to the brain. Timestamp is automaticaly handled.
 * Trigger a cleanup, too.
 * @param {any} value Something to store for a short time.
 * @return {number} The used timestamp.
 */
remember.Remember.prototype.set = function(value) {
    var now = Date.now();
    this.garbage(now);
    this.values[now] = value;
    this.timestamps.push(now);
    return now;
};

/**
 * Clean old values. Don't care about it, set method trigger it.
 * @param {number} now The timestamp used for computing.
 * @return {void} void.
 */
remember.Remember.prototype.garbage = function(now) {
    for (var i = this.timestamps.length - 1; i >= 0; i--) {
        var ts = this.timestamps[i];
        console.log(ts, now, this.howlong);
        if (ts < (now - this.howlong)) {
            this.timestamps.pop();
            delete this.values[ts];
        } else {
            return;
        }
    }
};

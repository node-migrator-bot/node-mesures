$(function() {

    var table = $('table');

    var stocks = new EventSource('/events');
    function escape(e) {
        return e.replace(/[#.]/g, '_');
    }
    var remembers = {};
    stocks.onmessage = function(event) {
        var data = JSON.parse(event.data); // read the event as JSON
        for (var k in data) {
            if(! remembers[k]) {
                remembers[k] = new Remember(60 * 1000);
            }
            remembers[k].set(data[k]);
            var line = $('#' + escape(k), table);
            if (line.length) { // the line exists
                line.text(Math.round(data[k]) + ' %');
            } else {
                table.append('<tr><td>' + k + '</td><td id="' + escape(k) + '">' +
                    Math.round(data[k]) + '% </td><td id="_' + escape(k) + '"><svg/></td></tr>');
            }
            d3.select('#_' + escape(k) + ' svg').
                attr('class', 'chart');
        }
    };

    var Remember = function(howlong) {
        this.howlong = howlong;
        this.values = {};
        this.timestamps = [];
    };

    Remember.prototype.set = function(value) {
        var now = Date.now();
        this.garbage(now);
        this.values[now] = value;
        this.timestamps.push(now);
        return now;
    };

    Remember.prototype.garbage = function(now) {
        for (var i=this.timestamps.length -1; i >= 0; i--) {
            var ts = this.timestamps[i];
            console.log(ts, now, this.howlong);
            if(ts < ( now - this.howlong ) ) {
                this.timestamps.pop();
                delete this.values[ts];
            } else {
                return;
            }
        }
    };

});

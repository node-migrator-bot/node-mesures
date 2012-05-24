$(function() {

    var table = $('table');

    var stocks = new EventSource('/events');
    function escape(e) {
        return e.replace(/[#.]/g, '_');
    }
    var remembers = {};
    // X scale will fit values from 0-10 within pixels 0-100
    var x = d3.scale.linear().domain([0, 100]).range([0, 50]);
    // Y scale will fit values from 0-10 within pixels 0-100
    var y = d3.scale.linear().domain([0, 100]).range([0, 30]);
    var draw = d3.svg.line().
        x(function(d, i) {
            console.log('d i', d, i);
            return x(i);}).
        y(function(d) {
            console.log(d);
            return y(d[0]);});
    stocks.onmessage = function(event) {
        var data = JSON.parse(event.data); // read the event as JSON
        for (var k in data) {
            if (! remembers[k]) {
                remembers[k] = new remember.Remember(60 * 1000);
            }
            remembers[k].set(data[k]);
            console.log('limits', remembers[k].limits());
            console.log('items', remembers[k].items());
            var line = $('#' + escape(k), table);
            if (line.length) { // the line exists
                line.text(Math.round(data[k]) + ' %');
            } else {
                table.append('<tr><td>' + k + '</td><td id="' + escape(k) +
                    '">' + Math.round(data[k]) +
                    '% </td><td class="graph" >' +
                    '<svg:svg width="100%" height="100%">' +
                    '<svg:path class="line" id="_' +
                    escape(k) + '"/></svg:svg></td></tr>');
            }
            var l = d3.select('#_' + escape(k)).
                attr('d', draw(remembers[k].items()));

        }
    };


});

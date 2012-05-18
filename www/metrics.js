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
                remembers[k] = new remember.Remember(60 * 1000);
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


});

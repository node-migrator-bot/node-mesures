var table = d3.select('#datas');

var stocks = new EventSource('/events');
function escape(e) {
    return e.replace(/[#.]/g, '_');
}
var remembers = {};
// X scale will fit values from 0-10 within pixels 0-100
var x = d3.scale.linear().domain([0, 100]).range([0, 50]);
// Y scale will fit values from 0-10 within pixels 0-100
var y = d3.scale.linear().domain([0, 100]).range([30, 0]);
var draw = d3.svg.line().
x(function(d, i) {
    console.log('d i', d, i);
    return x(i) * 10;}).
y(function(d) {
    console.log(d);
    return y(d[1]);});
/**
 * Handle a new message
 * @param {event} event An event.
 */
stocks.onmessage = function(event) {
    var data = JSON.parse(event.data); // read the event as JSON
    for (var k in data) {
        if (! remembers[k]) {
            remembers[k] = new remember.Remember(60 * 1000);
        }
        remembers[k].set(data[k]);
        console.log('limits', remembers[k].limits());
        console.log('items', remembers[k].items());
        var line = table.select('#' + escape(k));
        if (! line.empty()) { // the line exists
            line.text(Math.round(data[k]));
        } else {
            table.append('div').attr('class', 'data').html('<h2 class="title">' + k +
                    '</h2><div class="value" id="' + escape(k) + '">' +
                    Math.round(data[k]) + ' </div>' +
                    '<div class="graph" ><svg class="draw">' +
                    '<path class="line" id="_' +
                    escape(k) + '"/></svg>');
        }
        var l = d3.select('#_' + escape(k)).
            attr('d', draw(remembers[k].items()));

    }
};

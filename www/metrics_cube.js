var context = cubism.context()
    //.serverDelay(100)
    //.clientDelay(100)
    .step(30 * 1000)
    .size(960), // a default context
    cube = context.cube('');

var heapTotal = cube.metric('self.heapTotal MEAN');
var heapUsed = cube.metric('self.heapUsed MEAN');
var rss = cube.metric('self.rss MEAN');

d3.select("#rss").call(function(div) {

  div.append("div")
      .attr("class", "axis")
      .call(context.axis().orient("top"));

  div.selectAll(".horizon")
      .data([heapTotal, heapUsed, heapTotal.subtract(heapUsed), rss])
    .enter().append("div")
      .attr("class", "horizon")
      .call(context.horizon().extent([-20, 20]));

  div.append("div")
      .attr("class", "rule")
      .call(context.rule());

});


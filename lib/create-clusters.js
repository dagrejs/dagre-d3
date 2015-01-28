var util = require("./util"),
    addLabel = require("./label/add-label");

module.exports = createClusters;

function createClusters(selection, g) {
  var clusters = g.nodes().filter(function(v) { return util.isSubgraph(g, v); });
  var svgClusters = selection.selectAll("g.cluster")
        .data(clusters, function(v) { return v; })
        .classed("update", true);

  svgClusters.selectAll("*").remove();
  svgClusters.enter()
    .append("g")
      .attr("class", "cluster")
      .style("opacity", 0);

  svgClusters.each(function(v) {
    var cluster = g.node(v),
      thisGroup = d3.select(this),
      labelGroup = thisGroup.append("g").attr("class", "label");
      addLabel(labelGroup, cluster, true);
      thisGroup.append("rect");
  });

  util.applyTransition(svgClusters.exit(), g)
    .style("opacity", 0)
    .remove();

  util.applyTransition(svgClusters, g)
    .style("opacity", 1);

  util.applyTransition(svgClusters.selectAll("rect"), g)
    .attr("width", function(v) { return g.node(v).width; })
    .attr("height", function(v) { return g.node(v).height; })
    .attr("x", function(v) {
      var node = g.node(v);
      return node.x - node.width / 2;
    })
    .attr("y", function(v) {
      var node = g.node(v);
      return node.y - node.height / 2;
    });
}

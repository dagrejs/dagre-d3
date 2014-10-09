var util = require("./util");

module.exports = createClusters;

function createClusters(selection, g) {
  var clusters = g.nodes().filter(function(v) { return util.isSubgraph(g, v); }),
      svgClusters = selection.selectAll("g.cluster")
        .data(clusters, function(v) { return v; });

  svgClusters.enter()
    .append("g")
    .attr("class", "cluster")
    .append("rect");
  svgClusters.exit().remove();

  svgClusters.selectAll("rect")
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

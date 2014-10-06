var util = require("./util");

module.exports = drawClusters;

function drawClusters(selection, g) {
  var clusters = g.nodes().filter(function(v) { return util.isSubgraph(g, v); }),
      svgClusters = selection.selectAll("rect.cluster")
        .data(clusters, function(v) { return v; });

  svgClusters.enter().append("rect").attr("class", "cluster");
  svgClusters.exit().remove();

  svgClusters
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

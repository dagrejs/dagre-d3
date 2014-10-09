var addLabel = require("./label/add-label"),
    util = require("./util");

module.exports = createNodes;

function createNodes(selection, g) {
  var simpleNodes = g.nodes().filter(function(v) { return !util.isSubgraph(g, v); });
  var svgNodes = selection.selectAll("g.node")
    .data(simpleNodes, function(v) { return v; })
    .classed("update", true);

  svgNodes.selectAll("*").remove();
  svgNodes.enter().append("g").classed("node", true);
  svgNodes.each(function(v) {
    var node = g.node(v),
        labelDom = addLabel(d3.select(this), node, 10, 10);
    util.applyStyle(labelDom, node.style);
  });

  svgNodes.exit().remove();

  return svgNodes;
}

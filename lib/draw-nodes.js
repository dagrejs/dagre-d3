var addLabel = require("./label/add-label");

module.exports = drawNodes;

function drawNodes(selection, g) {
  var svgNodes = selection.selectAll("g.node")
    .data(g.nodes(), function(v) { return v; })
    .classed("update", true);

  svgNodes.selectAll("*").remove();
  svgNodes.enter().append("g").classed("node", true);
  svgNodes.each(function(v) {
    addLabel(d3.select(this), g.node(v), 10, 10);
  });

  svgNodes.exit().remove();

  return svgNodes;
}

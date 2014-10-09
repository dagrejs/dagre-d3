var addLabel = require("./label/add-label"),
    util = require("./util");

module.exports = createEdgeLabels;

function createEdgeLabels(selection, g) {
  var svgEdgeLabels = selection.selectAll("g.edgeLabel")
    .data(g.edges(), function(e) { return util.edgeToId(e); })
    .classed("update", true);

  svgEdgeLabels.selectAll("*").remove();
  svgEdgeLabels.enter().append("g").classed("edgeLabel", true);
  svgEdgeLabels.each(function(e) {
    addLabel(d3.select(this), g.edge(e), 0, 0);
  });

  svgEdgeLabels.exit().remove();

  return svgEdgeLabels;
}

var util = require("./util");

module.exports = drawEdgePaths;

function drawEdgePaths(selection, g) {
  var svgPaths = selection.selectAll("path.edgePath")
    .data(g.edges(), function(e) { return util.edgeToId(e); })
    .classed("update", true);

  svgPaths.enter().append("path").attr("class", "edgePath");
  svgPaths.exit().remove();

  return svgPaths;
}

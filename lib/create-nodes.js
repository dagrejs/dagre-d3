var addLabel = require("./label/add-label"),
    util = require("./util");

module.exports = createNodes;

function createNodes(selection, g, shapes) {
  var simpleNodes = g.nodes().filter(function(v) { return !util.isSubgraph(g, v); });
  var svgNodes = selection.selectAll("g.node")
    .data(simpleNodes, function(v) { return v; })
    .classed("update", true);

  svgNodes.selectAll("*").remove();
  svgNodes.enter().append("g").classed("node", true);
  svgNodes.each(function(v) {
    var node = g.node(v),
        labelDom = addLabel(d3.select(this), node),
        shape = shapes[node.shape] || shapes["default"],
        bbox = labelDom.node().getBBox();

    if (node.labelType !== "html") {
      bbox.width += 2 * 10;
      bbox.height += 2 * 10;
    }

    shapeDom = shape(d3.select(this), bbox, node);
  });

  svgNodes.exit().remove();

  return svgNodes;
}

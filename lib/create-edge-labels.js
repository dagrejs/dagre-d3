"use strict";

var _ = require("./lodash"),
    addLabel = require("./label/add-label"),
    util = require("./util"),
    d3 = require("./d3");

module.exports = createEdgeLabels;

function createEdgeLabels(selection, g) {
  var svgEdgeLabels = selection.selectAll("g.edgeLabel")
    .data(g.edges(), function(e) { return util.edgeToId(e); })
    .classed("update", true);

  svgEdgeLabels.selectAll("*").remove();
  svgEdgeLabels.enter()
    .append("g")
      .classed("edgeLabel", true)
      .style("opacity", 0);

  var itemQueue = [];
  var labelQueue = [];

  svgEdgeLabels.each(function(e) {
    var edge = g.edge(e);

    var label = addLabel.createLabel(d3.select(this), g.edge(e), 0, 0);

    label.labelSvg.classed("label", true);

    labelQueue.push(label);

    itemQueue.push({edge: edge, label: label.labelSvg});
  });

  addLabel.styleLabels(labelQueue);

  itemQueue.forEach(function(item) {
    item.bbox = item.label.node().getBBox();
  });

  itemQueue.forEach(function(item) {
    var label = item.label;
    var edge = item.edge;
    var bbox = item.bbox;

    if (edge.labelId) { label.attr("id", edge.labelId); }
    if (!_.has(edge, "width")) { edge.width = bbox.width; }
    if (!_.has(edge, "height")) { edge.height = bbox.height; }
  });

  util.applyTransition(svgEdgeLabels.exit(), g)
    .style("opacity", 0)
    .remove();

  return svgEdgeLabels;
}

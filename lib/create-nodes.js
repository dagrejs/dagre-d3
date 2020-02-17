"use strict";

var _ = require("./lodash"),
    addLabel = require("./label/add-label"),
    util = require("./util"),
    d3 = require("./d3");

module.exports = createNodes;

function createNodes(selection, g, shapes) {
  var simpleNodes = g.nodes().filter(function(v) { return !util.isSubgraph(g, v); });
  var svgNodes = selection.selectAll("g.node")
    .data(simpleNodes, function(v) { return v; })
    .classed("update", true);

  svgNodes.selectAll("*").remove();
  svgNodes.enter()
    .append("g")
      .attr("class", "node")
      .style("opacity", 0);

  // create queue for batch processing
  // batch reading from then writing to DOM for increased performance
  var itemQueue = [];
  var labelQueue = [];

  svgNodes.each(function(v) {
    var node = g.node(v),
        thisGroup = d3.select(this),
        labelGroup = thisGroup.append("g").attr("class", "label"),
        label = addLabel.createLabel(labelGroup, node),
        labelDom = label.labelSvg;

    labelQueue.push(label);

    // add to queue for further processing
    itemQueue.push({self: this, node: node, thisGroup: thisGroup, labelGroup: labelGroup, labelDom: labelDom});

  });

  addLabel.styleLabels(labelQueue);

  // get bounding box for each label
  itemQueue.forEach(function(item) {
    item.bbox = _.pick(item.labelDom.node().getBBox(), "width", "height");
  });

  // apply styles with bbox info
  itemQueue.forEach(function(item) {
    var node = item.node,
        thisGroup = item.thisGroup,
        labelGroup = item.labelGroup,
        self = item.self,
        bbox = item.bbox;

    var shape = shapes[node.shape];

    node.elem = self;

    if (node.id) { thisGroup.attr("id", node.id); }
    if (node.labelId) { labelGroup.attr("id", node.labelId); }
    util.applyClass(thisGroup, node["class"],
      (thisGroup.classed("update") ? "update " : "") + "node");

    if (_.has(node, "width")) { bbox.width = node.width; }
    if (_.has(node, "height")) { bbox.height = node.height; }

    bbox.width += node.paddingLeft + node.paddingRight;
    bbox.height += node.paddingTop + node.paddingBottom;
    labelGroup.attr("transform", "translate(" +
      ((node.paddingLeft - node.paddingRight) / 2) + "," +
      ((node.paddingTop - node.paddingBottom) / 2) + ")");

    item.shapeSvg = shape(d3.select(self), bbox, node);
  });

  itemQueue.forEach(function(item) {
    util.applyStyle(item.shapeSvg, item.node.style);
  });

  itemQueue.forEach(function(item) {
    item.shapeBBox = item.shapeSvg.node().getBBox();
  });

  itemQueue.forEach(function(item) {
    item.node.width = item.shapeBBox.width;
    item.node.height = item.shapeBBox.height;
  });

  util.applyTransition(svgNodes.exit(), g)
    .style("opacity", 0)
    .remove();

  return svgNodes;
}

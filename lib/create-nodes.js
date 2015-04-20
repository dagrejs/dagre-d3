"use strict";

var _ = require("./lodash"),
    addLabel = require("./label/add-label"),
    addSubnodes = require("./add-subnodes"),
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
  svgNodes.each(function(v) {
    var subnodeGroup, subnodeDom;
    var subnodeBBox = {width: 0, height: 0};
    var node = g.node(v),
        thisGroup = d3.select(this),
        labelGroup = thisGroup.append("g").attr("class", "label"),
        labelDom = addLabel(labelGroup, node),
        shape = shapes[node.shape],
        bbox = _.pick(labelDom.node().getBBox(), "width", "height");

    node.elem = this;

    // If the node has subnodes, add them to the node and modify the bbox.
    if (node.subnodes && node.subnodes.length) {
      subnodeGroup = thisGroup.append("g").attr("class", "subnodes"),
      subnodeDom = addSubnodes(subnodeGroup, node),

      // Calculate the box surrounding the subnode elements. Adjust bbox to hold them.
      subnodeBBox = _.pick(subnodeDom.node().getBBox(), "width", "height");
      bbox.height += subnodeBBox.height;
      bbox.width = Math.max(bbox.width, subnodeBBox.width);

      // Tie subnode ID to each subnode in the current node
      thisGroup.selectAll("g.subnodes circle").data(node.subnodes);
    } else {
      // The node doesn't have subnodes.
      subnodeGroup = subnodeDom = null;
      subnodeBBox.width = subnodeBBox.height = 0;
    }

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
      ((node.paddingTop - node.paddingBottom - subnodeBBox.height) / 2) + ")");
    if (subnodeGroup) {
      subnodeGroup.attr("transform", "translate(" +
        ((node.paddingLeft - node.paddingRight - (subnodeBBox.width / 2)) / 2) + "," +
        ((node.paddingTop - node.paddingBottom + subnodeBBox.height) / 2) + ")");
    }

    var shapeSvg = shape(d3.select(this), bbox, node);
    util.applyStyle(shapeSvg, node.style);

    var shapeBBox = shapeSvg.node().getBBox();
    node.width = shapeBBox.width;
    node.height = shapeBBox.height;
  });

  util.applyTransition(svgNodes.exit(), g)
    .style("opacity", 0)
    .remove();

  return svgNodes;
}

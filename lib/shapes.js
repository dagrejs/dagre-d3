"use strict";

var intersectRect = require("./intersect/intersect-rect"),
    intersectEllipse = require("./intersect/intersect-ellipse"),
    intersectCircle = require("./intersect/intersect-circle"),
    intersectPolygon = require("./intersect/intersect-polygon");

module.exports = {
  rect: rect,
  stack: stack,
  ellipse: ellipse,
  circle: circle,
  diamond: diamond,
};

function rect(parent, bbox, node) {
  var shapeSvg = parent.insert("rect", ":first-child")
        .attr("rx", node.rx)
        .attr("ry", node.ry)
        .attr("x", -bbox.width / 2)
        .attr("y", -bbox.height / 2)
        .attr("width", bbox.width)
        .attr("height", bbox.height);

  node.intersect = function(point) {
    return intersectRect(node, point);
  };

  // Handle multiple-label dividers
  if (typeof node.label === "object" && Array.isArray(node.label)) {
    for (var i = 1; i < node.label.length; i++) {
      var lineShape = parent.append("line");
      var dividerHeight = (bbox.height - node.paddingTop - node.paddingBottom) /
          node.label.length;
      lineShape
        .attr("x1", -bbox.width / 2)
        .attr("y1", i * dividerHeight - bbox.height / 2 + node.paddingTop)
        .attr("x2", bbox.width / 2)
        .attr("y2", i * dividerHeight - bbox.height / 2 + node.paddingTop)
        .attr("stroke", "black");
    }
  }

  return shapeSvg;
}

// Draw a stack of three rects, to represent an indefinite number of coalesced rects.
function stack(parent, bbox, node) {
  var shapeSvg = parent.insert('g', ':first-child');
  shapeSvg.append('rect')
        .attr('rx', node.rx)
        .attr('ry', node.ry)
        .attr('x', -bbox.width / 2 + 2)
        .attr('y', -bbox.height / 2 + 4)
        .attr('width', bbox.width)
        .attr('height', bbox.height);
  shapeSvg.append('rect')
        .attr('rx', node.rx)
        .attr('ry', node.ry)
        .attr('x', -bbox.width / 2)
        .attr('y', -bbox.height / 2)
        .attr('width', bbox.width)
        .attr('height', bbox.height);
  shapeSvg.append('rect')
        .attr('rx', node.rx)
        .attr('ry', node.ry)
        .attr('x', -bbox.width / 2 - 2)
        .attr('y', -bbox.height / 2 - 4)
        .attr('width', bbox.width)
        .attr('height', bbox.height);

  // Rectangle intersection calculation works on the group of stacked rects too.
  node.intersect = function(point) {
    return intersectRect(node, point);
  };

  return shapeSvg;
}

function ellipse(parent, bbox, node) {
  var rx = bbox.width / 2,
      ry = bbox.height / 2,
      shapeSvg = parent.insert("ellipse", ":first-child")
        .attr("x", -bbox.width / 2)
        .attr("y", -bbox.height / 2)
        .attr("rx", rx)
        .attr("ry", ry);

  node.intersect = function(point) {
    return intersectEllipse(node, rx, ry, point);
  };

  return shapeSvg;
}

function circle(parent, bbox, node) {
  var r = Math.max(bbox.width, bbox.height) / 2,
      shapeSvg = parent.insert("circle", ":first-child")
        .attr("x", -bbox.width / 2)
        .attr("y", -bbox.height / 2)
        .attr("r", r);

  node.intersect = function(point) {
    return intersectCircle(node, r, point);
  };

  return shapeSvg;
}

// Circumscribe an ellipse for the bounding box with a diamond shape. I derived
// the function to calculate the diamond shape from:
// http://mathforum.org/kb/message.jspa?messageID=3750236
function diamond(parent, bbox, node) {
  var w = (bbox.width * Math.SQRT2) / 2,
      h = (bbox.height * Math.SQRT2) / 2,
      points = [
        { x:  0, y: -h },
        { x: -w, y:  0 },
        { x:  0, y:  h },
        { x:  w, y:  0 }
      ],
      shapeSvg = parent.insert("polygon", ":first-child")
        .attr("points", points.map(function(p) { return p.x + "," + p.y; }).join(" "));

  node.intersect = function(p) {
    return intersectPolygon(node, points, p);
  };

  return shapeSvg;
}

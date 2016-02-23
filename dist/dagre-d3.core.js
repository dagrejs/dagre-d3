(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.dagreD3 = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @license
 * Copyright (c) 2012-2013 Chris Pettitt
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
module.exports =  {
  graphlib: require("./lib/graphlib"),
  dagre: require("./lib/dagre"),
  intersect: require("./lib/intersect"),
  render: require("./lib/render"),
  util: require("./lib/util"),
  version: require("./lib/version")
};

},{"./lib/dagre":8,"./lib/graphlib":9,"./lib/intersect":10,"./lib/render":25,"./lib/util":27,"./lib/version":28}],2:[function(require,module,exports){
var util = require("./util");

module.exports = {
  "default": normal,
  "normal": normal,
  "vee": vee,
  "undirected": undirected
};

function normal(parent, id, edge, type) {
  var marker = parent.append("marker")
    .attr("id", id)
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 9)
    .attr("refY", 5)
    .attr("markerUnits", "strokeWidth")
    .attr("markerWidth", 8)
    .attr("markerHeight", 6)
    .attr("orient", "auto");

  var path = marker.append("path")
    .attr("d", "M 0 0 L 10 5 L 0 10 z")
    .style("stroke-width", 1)
    .style("stroke-dasharray", "1,0");
  util.applyStyle(path, edge[type + "Style"]);
  if (edge[type + "Class"]) {
    path.attr("class", edge[type + "Class"]);
  }
}

function vee(parent, id, edge, type) {
  var marker = parent.append("marker")
    .attr("id", id)
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 9)
    .attr("refY", 5)
    .attr("markerUnits", "strokeWidth")
    .attr("markerWidth", 8)
    .attr("markerHeight", 6)
    .attr("orient", "auto");

  var path = marker.append("path")
    .attr("d", "M 0 0 L 10 5 L 0 10 L 4 5 z")
    .style("stroke-width", 1)
    .style("stroke-dasharray", "1,0");
  util.applyStyle(path, edge[type + "Style"]);
  if (edge[type + "Class"]) {
    path.attr("class", edge[type + "Class"]);
  }
}

function undirected(parent, id, edge, type) {
  var marker = parent.append("marker")
    .attr("id", id)
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 9)
    .attr("refY", 5)
    .attr("markerUnits", "strokeWidth")
    .attr("markerWidth", 8)
    .attr("markerHeight", 6)
    .attr("orient", "auto");

  var path = marker.append("path")
    .attr("d", "M 0 5 L 10 5")
    .style("stroke-width", 1)
    .style("stroke-dasharray", "1,0");
  util.applyStyle(path, edge[type + "Style"]);
  if (edge[type + "Class"]) {
    path.attr("class", edge[type + "Class"]);
  }
}

},{"./util":27}],3:[function(require,module,exports){
var util = require("./util"),
    addLabel = require("./label/add-label");

module.exports = createClusters;

function createClusters(selection, g) {
  var clusters = g.nodes().filter(function(v) { return util.isSubgraph(g, v); }),
      svgClusters = selection.selectAll("g.cluster")
        .data(clusters, function(v) { return v; });

  svgClusters.exit().remove();
  svgClusters.enter()
    .append("g")
      .attr("class", "cluster")
      .attr("id",function(v){
          var node = g.node(v);
          return node.id;
      })
      .style("opacity", 0);

  util.applyTransition(svgClusters, g)
    .style("opacity", 1);

  svgClusters.each(function(v) {
    var node = g.node(v),
        thisGroup = d3.select(this);
    d3.select(this).append("rect");
    var labelGroup = thisGroup.append("g").attr("class", "label");
    addLabel(labelGroup, node, node.clusterLabelPos);
  });

  svgClusters.selectAll("rect").each(function(c) {
    var node = g.node(c);
    var domCluster = d3.select(this);
    util.applyStyle(domCluster, node.style);
  });

  util.applyTransition(svgClusters.exit(), g)
    .style("opacity", 0)
    .remove();

  return svgClusters;
}

},{"./label/add-label":18,"./util":27}],4:[function(require,module,exports){
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

  svgEdgeLabels.exit().remove();
  svgEdgeLabels.enter()
    .append("g")
      .classed("edgeLabel", true)
      .style("opacity", 0);
  svgEdgeLabels.each(function(e) {
    var edge = g.edge(e),
        label = addLabel(d3.select(this), g.edge(e), 0, 0).classed("label", true),
        bbox = label.node().getBBox();

    if (edge.labelId) { label.attr("id", edge.labelId); }
    if (!_.has(edge, "width")) { edge.width = bbox.width; }
    if (!_.has(edge, "height")) { edge.height = bbox.height; }
  });

  util.applyTransition(svgEdgeLabels.exit(), g)
    .style("opacity", 0)
    .remove();

  return svgEdgeLabels;
}

},{"./d3":7,"./label/add-label":18,"./lodash":21,"./util":27}],5:[function(require,module,exports){
"use strict";

var _ = require("./lodash"),
    intersectNode = require("./intersect/intersect-node"),
    util = require("./util"),
    d3 = require("./d3");
module.exports = createEdgePaths;

function createEdgePaths(selection, g, arrows) {
  var svgPaths = selection.selectAll("g.edgePath")
    .data(g.edges(), function(e) { return util.edgeToId(e); })
    .classed("update", true);

  enter(svgPaths, g);
  exit(svgPaths, g);

  util.applyTransition(svgPaths, g)
    .style("opacity", 1);

  // Save DOM element in the path group, and set ID and class
  svgPaths.each(function(e) {
    var domEdge = d3.select(this);
    var edge = g.edge(e);
    edge.elem = this;

    if (edge.id) {
      domEdge.attr("id", edge.id);
    }

    util.applyClass(domEdge, edge["class"],
      (domEdge.classed("update") ? "update " : "") + "edgePath");
  });

  svgPaths.selectAll("path.path")
    .each(function(e) {
      var edge = g.edge(e);
      edge.arrowheadId = _.uniqueId("arrowhead");

      var domEdge = d3.select(this)
        .attr("marker-end", function() {
            return "url(" + makeFragmentRef(location.href, edge.arrowheadId) + ")";
        })
        .style("fill", "none");

      util.applyTransition(domEdge, g)
        .attr("d", function(e) { return calcPoints(g, e); });

      util.applyStyle(domEdge, edge.style);
    });

  svgPaths.selectAll("defs *").remove();
  svgPaths.selectAll("defs")
    .each(function(e) {
      var edge = g.edge(e),
          arrowhead = arrows[edge.arrowhead];
      arrowhead(d3.select(this), edge.arrowheadId, edge, "arrowhead");
    });

  return svgPaths;
}

function makeFragmentRef(url, fragmentId) {
  var baseUrl = url.split("#")[0];
  return baseUrl + "#" + fragmentId;
}

function calcPoints(g, e) {
  var edge = g.edge(e),
      tail = g.node(e.v),
      head = g.node(e.w),
      points = edge.points.slice(1, edge.points.length - 1);
  points.unshift(intersectNode(tail, points[0]));
  points.push(intersectNode(head, points[points.length - 1]));

  return createLine(edge, points);
}

function createLine(edge, points) {
  var line = d3.svg.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; });

  if (_.has(edge, "lineInterpolate")) {
    line.interpolate(edge.lineInterpolate);
  }

  if (_.has(edge, "lineTension")) {
    line.tension(Number(edge.lineTension));
  }

  return line(points);
}

function getCoords(elem) {
  var bbox = elem.getBBox(),
      matrix = elem.ownerSVGElement.getScreenCTM()
        .inverse()
        .multiply(elem.getScreenCTM())
        .translate(bbox.width / 2, bbox.height / 2);
  return { x: matrix.e, y: matrix.f };
}

function enter(svgPaths, g) {
  var svgPathsEnter = svgPaths.enter()
    .append("g")
      .attr("class", "edgePath")
      .style("opacity", 0);
  svgPathsEnter.append("path")
    .attr("class", "path")
    .attr("d", function(e) {
      var edge = g.edge(e),
          sourceElem = g.node(e.v).elem,
          points = _.range(edge.points.length).map(function() { return getCoords(sourceElem); });
      return createLine(edge, points);
    });
  svgPathsEnter.append("defs");
}

function exit(svgPaths, g) {
  var svgPathExit = svgPaths.exit();
  util.applyTransition(svgPathExit, g)
    .style("opacity", 0)
    .remove();

  util.applyTransition(svgPathExit.select("path.path"), g)
    .attr("d", function(e) {
      var source = g.node(e.v);

      if (source) {
        var points = _.range(this.getTotalLength()).map(function() { return source; });
        return createLine({}, points);
      } else {
        return d3.select(this).attr("d");
      }
    });
}

},{"./d3":7,"./intersect/intersect-node":14,"./lodash":21,"./util":27}],6:[function(require,module,exports){
"use strict";

var _ = require("./lodash"),
    addLabel = require("./label/add-label"),
    util = require("./util"),
    d3 = require("./d3");

module.exports = createNodes;

function createNodes(selection, g, shapes, scale) {
  var simpleNodes = g.nodes().filter(function(v) { return !util.isSubgraph(g, v); });
  var svgNodes = selection.selectAll("g.node")
    .data(simpleNodes, function(v) { return v; })
    .classed("update", true);

  svgNodes.exit().remove();
  svgNodes.enter()
    .append("g")
      .attr("class", "node")
      .style("opacity", 0);
  svgNodes.each(function(v) {
    var thisGroup = d3.select(this);
    var node = g.node(v),
        labelGroup = thisGroup.append("g").attr("class", "label"),
        labelDom = addLabel(labelGroup, node, null, scale),
        shape = shapes[node.shape],
        bbox = _.pick(labelDom.node().getBBox(), "width", "height");

    node.elem = this;

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

    var shapeSvg = shape(thisGroup, bbox, node, scale);
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

},{"./d3":7,"./label/add-label":18,"./lodash":21,"./util":27}],7:[function(require,module,exports){
// Stub to get D3 either via NPM or from the global object
module.exports = window.d3;

},{}],8:[function(require,module,exports){
/* global window */

var dagre;

if (require) {
  try {
    dagre = require("dagre");
  } catch (e) {}
}

if (!dagre) {
  dagre = window.dagre;
}

module.exports = dagre;

},{"dagre":undefined}],9:[function(require,module,exports){
/* global window */

var graphlib;

if (require) {
  try {
    graphlib = require("graphlib");
  } catch (e) {}
}

if (!graphlib) {
  graphlib = window.graphlib;
}

module.exports = graphlib;

},{"graphlib":undefined}],10:[function(require,module,exports){
module.exports = {
  node: require("./intersect-node"),
  circle: require("./intersect-circle"),
  ellipse: require("./intersect-ellipse"),
  polygon: require("./intersect-polygon"),
  rect: require("./intersect-rect")
};

},{"./intersect-circle":11,"./intersect-ellipse":12,"./intersect-node":14,"./intersect-polygon":15,"./intersect-rect":16}],11:[function(require,module,exports){
var intersectEllipse = require("./intersect-ellipse");

module.exports = intersectCircle;

function intersectCircle(node, rx, point) {
  return intersectEllipse(node, rx, rx, point);
}

},{"./intersect-ellipse":12}],12:[function(require,module,exports){
module.exports = intersectEllipse;

function intersectEllipse(node, rx, ry, point) {
  // Formulae from: http://mathworld.wolfram.com/Ellipse-LineIntersection.html

  var cx = node.x;
  var cy = node.y;

  var px = cx - point.x;
  var py = cy - point.y;

  var det = Math.sqrt(rx * rx * py * py + ry * ry * px * px);

  var dx = Math.abs(rx * ry * px / det);
  if (point.x < cx) {
    dx = -dx;
  }
  var dy = Math.abs(rx * ry * py / det);
  if (point.y < cy) {
    dy = -dy;
  }

  return {x: cx + dx, y: cy + dy};
}


},{}],13:[function(require,module,exports){
module.exports = intersectLine;

/*
 * Returns the point at which two lines, p and q, intersect or returns
 * undefined if they do not intersect.
 */
function intersectLine(p1, p2, q1, q2) {
  // Algorithm from J. Avro, (ed.) Graphics Gems, No 2, Morgan Kaufmann, 1994,
  // p7 and p473.

  var a1, a2, b1, b2, c1, c2;
  var r1, r2 , r3, r4;
  var denom, offset, num;
  var x, y;

  // Compute a1, b1, c1, where line joining points 1 and 2 is F(x,y) = a1 x +
  // b1 y + c1 = 0.
  a1 = p2.y - p1.y;
  b1 = p1.x - p2.x;
  c1 = (p2.x * p1.y) - (p1.x * p2.y);

  // Compute r3 and r4.
  r3 = ((a1 * q1.x) + (b1 * q1.y) + c1);
  r4 = ((a1 * q2.x) + (b1 * q2.y) + c1);

  // Check signs of r3 and r4. If both point 3 and point 4 lie on
  // same side of line 1, the line segments do not intersect.
  if ((r3 !== 0) && (r4 !== 0) && sameSign(r3, r4)) {
    return /*DONT_INTERSECT*/;
  }

  // Compute a2, b2, c2 where line joining points 3 and 4 is G(x,y) = a2 x + b2 y + c2 = 0
  a2 = q2.y - q1.y;
  b2 = q1.x - q2.x;
  c2 = (q2.x * q1.y) - (q1.x * q2.y);

  // Compute r1 and r2
  r1 = (a2 * p1.x) + (b2 * p1.y) + c2;
  r2 = (a2 * p2.x) + (b2 * p2.y) + c2;

  // Check signs of r1 and r2. If both point 1 and point 2 lie
  // on same side of second line segment, the line segments do
  // not intersect.
  if ((r1 !== 0) && (r2 !== 0) && (sameSign(r1, r2))) {
    return /*DONT_INTERSECT*/;
  }

  // Line segments intersect: compute intersection point.
  denom = (a1 * b2) - (a2 * b1);
  if (denom === 0) {
    return /*COLLINEAR*/;
  }

  offset = Math.abs(denom / 2);

  // The denom/2 is to get rounding instead of truncating. It
  // is added or subtracted to the numerator, depending upon the
  // sign of the numerator.
  num = (b1 * c2) - (b2 * c1);
  x = (num < 0) ? ((num - offset) / denom) : ((num + offset) / denom);

  num = (a2 * c1) - (a1 * c2);
  y = (num < 0) ? ((num - offset) / denom) : ((num + offset) / denom);

  return { x: x, y: y };
}

function sameSign(r1, r2) {
  return r1 * r2 > 0;
}

},{}],14:[function(require,module,exports){
module.exports = intersectNode;

function intersectNode(node, point) {
  return node.intersect(point);
}

},{}],15:[function(require,module,exports){
var intersectLine = require("./intersect-line");

module.exports = intersectPolygon;

/*
 * Returns the point ({x, y}) at which the point argument intersects with the
 * node argument assuming that it has the shape specified by polygon.
 */
function intersectPolygon(node, polyPoints, point) {
  var x1 = node.x;
  var y1 = node.y;

  var intersections = [];

  var minX = Number.POSITIVE_INFINITY,
      minY = Number.POSITIVE_INFINITY;
  polyPoints.forEach(function(entry) {
    minX = Math.min(minX, entry.x);
    minY = Math.min(minY, entry.y);
  });

  var left = x1 - node.width / 2 - minX;
  var top =  y1 - node.height / 2 - minY;

  for (var i = 0; i < polyPoints.length; i++) {
    var p1 = polyPoints[i];
    var p2 = polyPoints[i < polyPoints.length - 1 ? i + 1 : 0];
    var intersect = intersectLine(node, point,
      {x: left + p1.x, y: top + p1.y}, {x: left + p2.x, y: top + p2.y});
    if (intersect) {
      intersections.push(intersect);
    }
  }

  if (!intersections.length) {
    console.log("NO INTERSECTION FOUND, RETURN NODE CENTER", node);
    return node;
  }

  if (intersections.length > 1) {
    // More intersections, find the one nearest to edge end point
    intersections.sort(function(p, q) {
      var pdx = p.x - point.x,
          pdy = p.y - point.y,
          distp = Math.sqrt(pdx * pdx + pdy * pdy),

          qdx = q.x - point.x,
          qdy = q.y - point.y,
          distq = Math.sqrt(qdx * qdx + qdy * qdy);

      return (distp < distq) ? -1 : (distp === distq ? 0 : 1);
    });
  }
  return intersections[0];
}

},{"./intersect-line":13}],16:[function(require,module,exports){
module.exports = intersectRect;

function intersectRect(node, point) {
  var x = node.x;
  var y = node.y;

  // Rectangle intersection algorithm from:
  // http://math.stackexchange.com/questions/108113/find-edge-between-two-boxes
  var dx = point.x - x;
  var dy = point.y - y;
  var w = node.width / 2;
  var h = node.height / 2;

  var sx, sy;
  if (Math.abs(dy) * w > Math.abs(dx) * h) {
    // Intersection is top or bottom of rect.
    if (dy < 0) {
      h = -h;
    }
    sx = dy === 0 ? 0 : h * dx / dy;
    sy = h;
  } else {
    // Intersection is left or right of rect.
    if (dx < 0) {
      w = -w;
    }
    sx = w;
    sy = dx === 0 ? 0 : w * dy / dx;
  }

  return {x: x + sx, y: y + sy};
}

},{}],17:[function(require,module,exports){
var util = require("../util");

module.exports = addHtmlLabel;

function addHtmlLabel(root, node) {
  var fo = root
    .append("foreignObject")
      .attr("width", "100000");

  var div = fo
    .append("xhtml:div");
  div.attr("xmlns", "http://www.w3.org/1999/xhtml");

  var label = node.label;
  switch(typeof label) {
    case "function":
      div.insert(label);
      break;
    case "object":
      // Currently we assume this is a DOM object.
      div.insert(function() { return label; });
      break;
    default: div.html(label);
  }

  util.applyStyle(div, node.labelStyle);
  div.style("display", "inline-block");
  // Fix for firefox
  div.style("white-space", "nowrap");

  //var client = div[0][0].getBoundingClientRect();
  //fo
  //  .attr("width", client.width * (1/scale))
  //  .attr("height", client.height * (1/scale));
  //
  //return fo;
  var w, h;
  div
      .each(function() {
        w = this.clientWidth;
        h = this.clientHeight;
      });

  fo
      .attr("width", w)
      .attr("height", h);

  return fo;
}

},{"../util":27}],18:[function(require,module,exports){
var addTextLabel = require("./add-text-label"),
    addHtmlLabel = require("./add-html-label"),
    addSVGLabel  = require("./add-svg-label");

module.exports = addLabel;

function addLabel(root, node, location, scale) {
  var label = node.label;
  var labelSvg = root.append("g");

  // Allow the label to be a string, a function that returns a DOM element, or
  // a DOM element itself.
  if (node.labelType === "svg") {
    addSVGLabel(labelSvg, node);
  } else if (typeof label !== "string" || node.labelType === "html") {
    addHtmlLabel(labelSvg, node, scale);
  } else {
    addTextLabel(labelSvg, node);
  }

  var labelBBox = labelSvg.node().getBBox();
  var y;
  switch(location) {
    case "top":
      y = (-node.height / 2);
      break;
    case "bottom":
      y = (node.height / 2) - labelBBox.height;
      break;
    default:
      y = (-labelBBox.height / 2);
  }
  labelSvg.attr("transform",
                "translate(" + (-labelBBox.width / 2) + "," + y + ")");

  return labelSvg;
}

},{"./add-html-label":17,"./add-svg-label":19,"./add-text-label":20}],19:[function(require,module,exports){
var util = require("../util");

module.exports = addSVGLabel;

function addSVGLabel(root, node) {
  var domNode = root;

  domNode.node().appendChild(node.label);

  util.applyStyle(domNode, node.labelStyle);

  return domNode;
}

},{"../util":27}],20:[function(require,module,exports){
var util = require("../util");

module.exports = addTextLabel;

/*
 * Attaches a text label to the specified root. Handles escape sequences.
 */
function addTextLabel(root, node) {
  var domNode = root.append("text");

  var lines = processEscapeSequences(node.label).split("\n");
  for (var i = 0; i < lines.length; i++) {
    domNode
      .append("tspan")
        .attr("xml:space", "preserve")
        .attr("dy", "1em")
        .attr("x", "1")
        .text(lines[i]);
  }

  util.applyStyle(domNode, node.labelStyle);

  return domNode;
}

function processEscapeSequences(text) {
  var newText = "",
      escaped = false,
      ch;
  for (var i = 0; i < text.length; ++i) {
    ch = text[i];
    if (escaped) {
      switch(ch) {
        case "n": newText += "\n"; break;
        default: newText += ch;
      }
      escaped = false;
    } else if (ch === "\\") {
      escaped = true;
    } else {
      newText += ch;
    }
  }
  return newText;
}

},{"../util":27}],21:[function(require,module,exports){
/* global window */

var lodash;

if (require) {
  try {
    lodash = require("lodash");
  } catch (e) {}
}

if (!lodash) {
  lodash = window._;
}

module.exports = lodash;

},{"lodash":undefined}],22:[function(require,module,exports){
"use strict";

var util = require("./util"),
    d3 = require("./d3");

module.exports = positionClusters;

function positionClusters(selection, g) {
  var created = selection.filter(function() { return !d3.select(this).classed("update"); });

  function translate(v) {
    var node = g.node(v);
    return "translate(" + node.x + "," + node.y + ")";
  }

  created.attr("transform", translate);

  util.applyTransition(selection, g)
      .style("opacity", 1)
      .attr("transform", translate);

  util.applyTransition(created.selectAll("rect"), g)
      .attr("width", function(v) { return g.node(v).width; })
      .attr("height", function(v) { return g.node(v).height; })
      .attr("x", function(v) {
        var node = g.node(v);
        return -node.width / 2;
      })
      .attr("y", function(v) {
        var node = g.node(v);
        return -node.height / 2;
      });

}

},{"./d3":7,"./util":27}],23:[function(require,module,exports){
"use strict";

var util = require("./util"),
    d3 = require("./d3"),
    _ = require("./lodash");

module.exports = positionEdgeLabels;

function positionEdgeLabels(selection, g) {
  var created = selection.filter(function() { return !d3.select(this).classed("update"); });

  function translate(e) {
    var edge = g.edge(e);
    return _.has(edge, "x") ? "translate(" + edge.x + "," + edge.y + ")" : "";
  }

  created.attr("transform", translate);

  util.applyTransition(selection, g)
    .style("opacity", 1)
    .attr("transform", translate);
}

},{"./d3":7,"./lodash":21,"./util":27}],24:[function(require,module,exports){
"use strict";

var util = require("./util"),
    d3 = require("./d3");

module.exports = positionNodes;

function positionNodes(selection, g) {
  var created = selection.filter(function() { return !d3.select(this).classed("update"); });

  function translate(v) {
    var node = g.node(v);
    return "translate(" + node.x + "," + node.y + ")";
  }

  created.attr("transform", translate);

  util.applyTransition(selection, g)
    .style("opacity", 1)
    .attr("transform", translate);
}

},{"./d3":7,"./util":27}],25:[function(require,module,exports){
var _ = require("./lodash"),
    layout = require("./dagre").layout;

module.exports = render;

// This design is based on http://bost.ocks.org/mike/chart/.
function render(scale) {
  if(!scale) scale = 1;
  var createNodes = require("./create-nodes"),
      createClusters = require("./create-clusters"),
      createEdgeLabels = require("./create-edge-labels"),
      createEdgePaths = require("./create-edge-paths"),
      positionNodes = require("./position-nodes"),
      positionEdgeLabels = require("./position-edge-labels"),
      positionClusters = require("./position-clusters"),
      shapes = require("./shapes"),
      arrows = require("./arrows");

  var fn = function(svg, g) {
    preProcessGraph(g);

    var outputGroup = createOrSelectGroup(svg, "output"),
        clustersGroup = createOrSelectGroup(outputGroup, "clusters"),
        edgePathsGroup = createOrSelectGroup(outputGroup, "edgePaths"),
        edgeLabels = createEdgeLabels(createOrSelectGroup(outputGroup, "edgeLabels"), g),
        nodes = createNodes(createOrSelectGroup(outputGroup, "nodes"), g, shapes, scale);

    layout(g);

    positionNodes(nodes, g);
    positionEdgeLabels(edgeLabels, g);
    createEdgePaths(edgePathsGroup, g, arrows);

    var clusters = createClusters(clustersGroup, g);
    positionClusters(clusters, g);

    postProcessGraph(g);
  };

  fn.createNodes = function(value) {
    if (!arguments.length) return createNodes;
    createNodes = value;
    return fn;
  };

  fn.createClusters = function(value) {
    if (!arguments.length) return createClusters;
    createClusters = value;
    return fn;
  };

  fn.createEdgeLabels = function(value) {
    if (!arguments.length) return createEdgeLabels;
    createEdgeLabels = value;
    return fn;
  };

  fn.createEdgePaths = function(value) {
    if (!arguments.length) return createEdgePaths;
    createEdgePaths = value;
    return fn;
  };

  fn.shapes = function(value) {
    if (!arguments.length) return shapes;
    shapes = value;
    return fn;
  };

  fn.arrows = function(value) {
    if (!arguments.length) return arrows;
    arrows = value;
    return fn;
  };

  return fn;
}

var NODE_DEFAULT_ATTRS = {
  paddingLeft: 10,
  paddingRight: 10,
  paddingTop: 10,
  paddingBottom: 10,
  rx: 0,
  ry: 0,
  shape: "rect"
};

var EDGE_DEFAULT_ATTRS = {
  arrowhead: "normal",
  lineInterpolate: "linear"
};

function preProcessGraph(g) {
  g.nodes().forEach(function(v) {
    var node = g.node(v);
    if (!_.has(node, "label") && !g.children(v).length) { node.label = v; }

    if (_.has(node, "paddingX")) {
      _.defaults(node, {
        paddingLeft: node.paddingX,
        paddingRight: node.paddingX
      });
    }

    if (_.has(node, "paddingY")) {
      _.defaults(node, {
        paddingTop: node.paddingY,
        paddingBottom: node.paddingY
      });
    }

    if (_.has(node, "padding")) {
      _.defaults(node, {
        paddingLeft: node.padding,
        paddingRight: node.padding,
        paddingTop: node.padding,
        paddingBottom: node.padding
      });
    }

    _.defaults(node, NODE_DEFAULT_ATTRS);

    _.each(["paddingLeft", "paddingRight", "paddingTop", "paddingBottom"], function(k) {
      node[k] = Number(node[k]);
    });

    // Save dimensions for restore during post-processing
    if (_.has(node, "width")) { node._prevWidth = node.width; }
    if (_.has(node, "height")) { node._prevHeight = node.height; }
  });

  g.edges().forEach(function(e) {
    var edge = g.edge(e);
    if (!_.has(edge, "label")) { edge.label = ""; }
    _.defaults(edge, EDGE_DEFAULT_ATTRS);
  });
}

function postProcessGraph(g) {
  _.each(g.nodes(), function(v) {
    var node = g.node(v);

    // Restore original dimensions
    if (_.has(node, "_prevWidth")) {
      node.width = node._prevWidth;
    } else {
      delete node.width;
    }

    if (_.has(node, "_prevHeight")) {
      node.height = node._prevHeight;
    } else {
      delete node.height;
    }

    delete node._prevWidth;
    delete node._prevHeight;
  });
}

function createOrSelectGroup(root, name) {
  var selection = root.select("g." + name);
  if (selection.empty()) {
    selection = root.append("g").attr("class", name);
  }
  return selection;
}

},{"./arrows":2,"./create-clusters":3,"./create-edge-labels":4,"./create-edge-paths":5,"./create-nodes":6,"./dagre":8,"./lodash":21,"./position-clusters":22,"./position-edge-labels":23,"./position-nodes":24,"./shapes":26}],26:[function(require,module,exports){
"use strict";

var intersectRect = require("./intersect/intersect-rect"),
    intersectEllipse = require("./intersect/intersect-ellipse"),
    intersectCircle = require("./intersect/intersect-circle"),
    intersectPolygon = require("./intersect/intersect-polygon");

module.exports = {
  rect: rect,
  ellipse: ellipse,
  circle: circle,
  diamond: diamond
};

function rect(parent, bbox, node, scale) {
  var multiplier = scale ? (1/scale) : 1;
  console.log(multiplier);
  parent.selectAll("rect").remove();
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

  return shapeSvg;
}

function ellipse(parent, bbox, node) {
  parent.selectAll("ellipse").remove();
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
  parent.selectAll("circle").remove();
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
  parent.selectAll("polygon").remove();
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

},{"./intersect/intersect-circle":11,"./intersect/intersect-ellipse":12,"./intersect/intersect-polygon":15,"./intersect/intersect-rect":16}],27:[function(require,module,exports){
var _ = require("./lodash");

// Public utility functions
module.exports = {
  isSubgraph: isSubgraph,
  edgeToId: edgeToId,
  applyStyle: applyStyle,
  applyClass: applyClass,
  applyTransition: applyTransition
};

/*
 * Returns true if the specified node in the graph is a subgraph node. A
 * subgraph node is one that contains other nodes.
 */
function isSubgraph(g, v) {
  return !!g.children(v).length;
}

function edgeToId(e) {
  return escapeId(e.v) + ":" + escapeId(e.w) + ":" + escapeId(e.name);
}

var ID_DELIM = /:/g;
function escapeId(str) {
  return str ? String(str).replace(ID_DELIM, "\\:") : "";
}

function applyStyle(dom, styleFn) {
  if (styleFn) {
    dom.attr("style", styleFn);
  }
}

function applyClass(dom, classFn, otherClasses) {
  if (classFn) {
    dom
      .attr("class", classFn)
      .attr("class", otherClasses + " " + dom.attr("class"));
  }
}

function applyTransition(selection, g) {
  var graph = g.graph();

  if (_.isPlainObject(graph)) {
    var transition = graph.transition;
    if (_.isFunction(transition)) {
      return transition(selection);
    }
  }

  return selection;
}

},{"./lodash":21}],28:[function(require,module,exports){
module.exports = "0.4.18-pre";

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsImxpYi9hcnJvd3MuanMiLCJsaWIvY3JlYXRlLWNsdXN0ZXJzLmpzIiwibGliL2NyZWF0ZS1lZGdlLWxhYmVscy5qcyIsImxpYi9jcmVhdGUtZWRnZS1wYXRocy5qcyIsImxpYi9jcmVhdGUtbm9kZXMuanMiLCJsaWIvZDMuanMiLCJsaWIvZGFncmUuanMiLCJsaWIvZ3JhcGhsaWIuanMiLCJsaWIvaW50ZXJzZWN0L2luZGV4LmpzIiwibGliL2ludGVyc2VjdC9pbnRlcnNlY3QtY2lyY2xlLmpzIiwibGliL2ludGVyc2VjdC9pbnRlcnNlY3QtZWxsaXBzZS5qcyIsImxpYi9pbnRlcnNlY3QvaW50ZXJzZWN0LWxpbmUuanMiLCJsaWIvaW50ZXJzZWN0L2ludGVyc2VjdC1ub2RlLmpzIiwibGliL2ludGVyc2VjdC9pbnRlcnNlY3QtcG9seWdvbi5qcyIsImxpYi9pbnRlcnNlY3QvaW50ZXJzZWN0LXJlY3QuanMiLCJsaWIvbGFiZWwvYWRkLWh0bWwtbGFiZWwuanMiLCJsaWIvbGFiZWwvYWRkLWxhYmVsLmpzIiwibGliL2xhYmVsL2FkZC1zdmctbGFiZWwuanMiLCJsaWIvbGFiZWwvYWRkLXRleHQtbGFiZWwuanMiLCJsaWIvbG9kYXNoLmpzIiwibGliL3Bvc2l0aW9uLWNsdXN0ZXJzLmpzIiwibGliL3Bvc2l0aW9uLWVkZ2UtbGFiZWxzLmpzIiwibGliL3Bvc2l0aW9uLW5vZGVzLmpzIiwibGliL3JlbmRlci5qcyIsImxpYi9zaGFwZXMuanMiLCJsaWIvdXRpbC5qcyIsImxpYi92ZXJzaW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxMi0yMDEzIENocmlzIFBldHRpdHRcbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbiAqIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuICogVEhFIFNPRlRXQVJFLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9ICB7XG4gIGdyYXBobGliOiByZXF1aXJlKFwiLi9saWIvZ3JhcGhsaWJcIiksXG4gIGRhZ3JlOiByZXF1aXJlKFwiLi9saWIvZGFncmVcIiksXG4gIGludGVyc2VjdDogcmVxdWlyZShcIi4vbGliL2ludGVyc2VjdFwiKSxcbiAgcmVuZGVyOiByZXF1aXJlKFwiLi9saWIvcmVuZGVyXCIpLFxuICB1dGlsOiByZXF1aXJlKFwiLi9saWIvdXRpbFwiKSxcbiAgdmVyc2lvbjogcmVxdWlyZShcIi4vbGliL3ZlcnNpb25cIilcbn07XG4iLCJ2YXIgdXRpbCA9IHJlcXVpcmUoXCIuL3V0aWxcIik7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBcImRlZmF1bHRcIjogbm9ybWFsLFxuICBcIm5vcm1hbFwiOiBub3JtYWwsXG4gIFwidmVlXCI6IHZlZSxcbiAgXCJ1bmRpcmVjdGVkXCI6IHVuZGlyZWN0ZWRcbn07XG5cbmZ1bmN0aW9uIG5vcm1hbChwYXJlbnQsIGlkLCBlZGdlLCB0eXBlKSB7XG4gIHZhciBtYXJrZXIgPSBwYXJlbnQuYXBwZW5kKFwibWFya2VyXCIpXG4gICAgLmF0dHIoXCJpZFwiLCBpZClcbiAgICAuYXR0cihcInZpZXdCb3hcIiwgXCIwIDAgMTAgMTBcIilcbiAgICAuYXR0cihcInJlZlhcIiwgOSlcbiAgICAuYXR0cihcInJlZllcIiwgNSlcbiAgICAuYXR0cihcIm1hcmtlclVuaXRzXCIsIFwic3Ryb2tlV2lkdGhcIilcbiAgICAuYXR0cihcIm1hcmtlcldpZHRoXCIsIDgpXG4gICAgLmF0dHIoXCJtYXJrZXJIZWlnaHRcIiwgNilcbiAgICAuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIik7XG5cbiAgdmFyIHBhdGggPSBtYXJrZXIuYXBwZW5kKFwicGF0aFwiKVxuICAgIC5hdHRyKFwiZFwiLCBcIk0gMCAwIEwgMTAgNSBMIDAgMTAgelwiKVxuICAgIC5zdHlsZShcInN0cm9rZS13aWR0aFwiLCAxKVxuICAgIC5zdHlsZShcInN0cm9rZS1kYXNoYXJyYXlcIiwgXCIxLDBcIik7XG4gIHV0aWwuYXBwbHlTdHlsZShwYXRoLCBlZGdlW3R5cGUgKyBcIlN0eWxlXCJdKTtcbiAgaWYgKGVkZ2VbdHlwZSArIFwiQ2xhc3NcIl0pIHtcbiAgICBwYXRoLmF0dHIoXCJjbGFzc1wiLCBlZGdlW3R5cGUgKyBcIkNsYXNzXCJdKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB2ZWUocGFyZW50LCBpZCwgZWRnZSwgdHlwZSkge1xuICB2YXIgbWFya2VyID0gcGFyZW50LmFwcGVuZChcIm1hcmtlclwiKVxuICAgIC5hdHRyKFwiaWRcIiwgaWQpXG4gICAgLmF0dHIoXCJ2aWV3Qm94XCIsIFwiMCAwIDEwIDEwXCIpXG4gICAgLmF0dHIoXCJyZWZYXCIsIDkpXG4gICAgLmF0dHIoXCJyZWZZXCIsIDUpXG4gICAgLmF0dHIoXCJtYXJrZXJVbml0c1wiLCBcInN0cm9rZVdpZHRoXCIpXG4gICAgLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCA4KVxuICAgIC5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDYpXG4gICAgLmF0dHIoXCJvcmllbnRcIiwgXCJhdXRvXCIpO1xuXG4gIHZhciBwYXRoID0gbWFya2VyLmFwcGVuZChcInBhdGhcIilcbiAgICAuYXR0cihcImRcIiwgXCJNIDAgMCBMIDEwIDUgTCAwIDEwIEwgNCA1IHpcIilcbiAgICAuc3R5bGUoXCJzdHJva2Utd2lkdGhcIiwgMSlcbiAgICAuc3R5bGUoXCJzdHJva2UtZGFzaGFycmF5XCIsIFwiMSwwXCIpO1xuICB1dGlsLmFwcGx5U3R5bGUocGF0aCwgZWRnZVt0eXBlICsgXCJTdHlsZVwiXSk7XG4gIGlmIChlZGdlW3R5cGUgKyBcIkNsYXNzXCJdKSB7XG4gICAgcGF0aC5hdHRyKFwiY2xhc3NcIiwgZWRnZVt0eXBlICsgXCJDbGFzc1wiXSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdW5kaXJlY3RlZChwYXJlbnQsIGlkLCBlZGdlLCB0eXBlKSB7XG4gIHZhciBtYXJrZXIgPSBwYXJlbnQuYXBwZW5kKFwibWFya2VyXCIpXG4gICAgLmF0dHIoXCJpZFwiLCBpZClcbiAgICAuYXR0cihcInZpZXdCb3hcIiwgXCIwIDAgMTAgMTBcIilcbiAgICAuYXR0cihcInJlZlhcIiwgOSlcbiAgICAuYXR0cihcInJlZllcIiwgNSlcbiAgICAuYXR0cihcIm1hcmtlclVuaXRzXCIsIFwic3Ryb2tlV2lkdGhcIilcbiAgICAuYXR0cihcIm1hcmtlcldpZHRoXCIsIDgpXG4gICAgLmF0dHIoXCJtYXJrZXJIZWlnaHRcIiwgNilcbiAgICAuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIik7XG5cbiAgdmFyIHBhdGggPSBtYXJrZXIuYXBwZW5kKFwicGF0aFwiKVxuICAgIC5hdHRyKFwiZFwiLCBcIk0gMCA1IEwgMTAgNVwiKVxuICAgIC5zdHlsZShcInN0cm9rZS13aWR0aFwiLCAxKVxuICAgIC5zdHlsZShcInN0cm9rZS1kYXNoYXJyYXlcIiwgXCIxLDBcIik7XG4gIHV0aWwuYXBwbHlTdHlsZShwYXRoLCBlZGdlW3R5cGUgKyBcIlN0eWxlXCJdKTtcbiAgaWYgKGVkZ2VbdHlwZSArIFwiQ2xhc3NcIl0pIHtcbiAgICBwYXRoLmF0dHIoXCJjbGFzc1wiLCBlZGdlW3R5cGUgKyBcIkNsYXNzXCJdKTtcbiAgfVxufVxuIiwidmFyIHV0aWwgPSByZXF1aXJlKFwiLi91dGlsXCIpLFxuICAgIGFkZExhYmVsID0gcmVxdWlyZShcIi4vbGFiZWwvYWRkLWxhYmVsXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUNsdXN0ZXJzO1xuXG5mdW5jdGlvbiBjcmVhdGVDbHVzdGVycyhzZWxlY3Rpb24sIGcpIHtcbiAgdmFyIGNsdXN0ZXJzID0gZy5ub2RlcygpLmZpbHRlcihmdW5jdGlvbih2KSB7IHJldHVybiB1dGlsLmlzU3ViZ3JhcGgoZywgdik7IH0pLFxuICAgICAgc3ZnQ2x1c3RlcnMgPSBzZWxlY3Rpb24uc2VsZWN0QWxsKFwiZy5jbHVzdGVyXCIpXG4gICAgICAgIC5kYXRhKGNsdXN0ZXJzLCBmdW5jdGlvbih2KSB7IHJldHVybiB2OyB9KTtcblxuICBzdmdDbHVzdGVycy5leGl0KCkucmVtb3ZlKCk7XG4gIHN2Z0NsdXN0ZXJzLmVudGVyKClcbiAgICAuYXBwZW5kKFwiZ1wiKVxuICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImNsdXN0ZXJcIilcbiAgICAgIC5hdHRyKFwiaWRcIixmdW5jdGlvbih2KXtcbiAgICAgICAgICB2YXIgbm9kZSA9IGcubm9kZSh2KTtcbiAgICAgICAgICByZXR1cm4gbm9kZS5pZDtcbiAgICAgIH0pXG4gICAgICAuc3R5bGUoXCJvcGFjaXR5XCIsIDApO1xuXG4gIHV0aWwuYXBwbHlUcmFuc2l0aW9uKHN2Z0NsdXN0ZXJzLCBnKVxuICAgIC5zdHlsZShcIm9wYWNpdHlcIiwgMSk7XG5cbiAgc3ZnQ2x1c3RlcnMuZWFjaChmdW5jdGlvbih2KSB7XG4gICAgdmFyIG5vZGUgPSBnLm5vZGUodiksXG4gICAgICAgIHRoaXNHcm91cCA9IGQzLnNlbGVjdCh0aGlzKTtcbiAgICBkMy5zZWxlY3QodGhpcykuYXBwZW5kKFwicmVjdFwiKTtcbiAgICB2YXIgbGFiZWxHcm91cCA9IHRoaXNHcm91cC5hcHBlbmQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcImxhYmVsXCIpO1xuICAgIGFkZExhYmVsKGxhYmVsR3JvdXAsIG5vZGUsIG5vZGUuY2x1c3RlckxhYmVsUG9zKTtcbiAgfSk7XG5cbiAgc3ZnQ2x1c3RlcnMuc2VsZWN0QWxsKFwicmVjdFwiKS5lYWNoKGZ1bmN0aW9uKGMpIHtcbiAgICB2YXIgbm9kZSA9IGcubm9kZShjKTtcbiAgICB2YXIgZG9tQ2x1c3RlciA9IGQzLnNlbGVjdCh0aGlzKTtcbiAgICB1dGlsLmFwcGx5U3R5bGUoZG9tQ2x1c3Rlciwgbm9kZS5zdHlsZSk7XG4gIH0pO1xuXG4gIHV0aWwuYXBwbHlUcmFuc2l0aW9uKHN2Z0NsdXN0ZXJzLmV4aXQoKSwgZylcbiAgICAuc3R5bGUoXCJvcGFjaXR5XCIsIDApXG4gICAgLnJlbW92ZSgpO1xuXG4gIHJldHVybiBzdmdDbHVzdGVycztcbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoXCIuL2xvZGFzaFwiKSxcbiAgICBhZGRMYWJlbCA9IHJlcXVpcmUoXCIuL2xhYmVsL2FkZC1sYWJlbFwiKSxcbiAgICB1dGlsID0gcmVxdWlyZShcIi4vdXRpbFwiKSxcbiAgICBkMyA9IHJlcXVpcmUoXCIuL2QzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUVkZ2VMYWJlbHM7XG5cbmZ1bmN0aW9uIGNyZWF0ZUVkZ2VMYWJlbHMoc2VsZWN0aW9uLCBnKSB7XG4gIHZhciBzdmdFZGdlTGFiZWxzID0gc2VsZWN0aW9uLnNlbGVjdEFsbChcImcuZWRnZUxhYmVsXCIpXG4gICAgLmRhdGEoZy5lZGdlcygpLCBmdW5jdGlvbihlKSB7IHJldHVybiB1dGlsLmVkZ2VUb0lkKGUpOyB9KVxuICAgIC5jbGFzc2VkKFwidXBkYXRlXCIsIHRydWUpO1xuXG4gIHN2Z0VkZ2VMYWJlbHMuZXhpdCgpLnJlbW92ZSgpO1xuICBzdmdFZGdlTGFiZWxzLmVudGVyKClcbiAgICAuYXBwZW5kKFwiZ1wiKVxuICAgICAgLmNsYXNzZWQoXCJlZGdlTGFiZWxcIiwgdHJ1ZSlcbiAgICAgIC5zdHlsZShcIm9wYWNpdHlcIiwgMCk7XG4gIHN2Z0VkZ2VMYWJlbHMuZWFjaChmdW5jdGlvbihlKSB7XG4gICAgdmFyIGVkZ2UgPSBnLmVkZ2UoZSksXG4gICAgICAgIGxhYmVsID0gYWRkTGFiZWwoZDMuc2VsZWN0KHRoaXMpLCBnLmVkZ2UoZSksIDAsIDApLmNsYXNzZWQoXCJsYWJlbFwiLCB0cnVlKSxcbiAgICAgICAgYmJveCA9IGxhYmVsLm5vZGUoKS5nZXRCQm94KCk7XG5cbiAgICBpZiAoZWRnZS5sYWJlbElkKSB7IGxhYmVsLmF0dHIoXCJpZFwiLCBlZGdlLmxhYmVsSWQpOyB9XG4gICAgaWYgKCFfLmhhcyhlZGdlLCBcIndpZHRoXCIpKSB7IGVkZ2Uud2lkdGggPSBiYm94LndpZHRoOyB9XG4gICAgaWYgKCFfLmhhcyhlZGdlLCBcImhlaWdodFwiKSkgeyBlZGdlLmhlaWdodCA9IGJib3guaGVpZ2h0OyB9XG4gIH0pO1xuXG4gIHV0aWwuYXBwbHlUcmFuc2l0aW9uKHN2Z0VkZ2VMYWJlbHMuZXhpdCgpLCBnKVxuICAgIC5zdHlsZShcIm9wYWNpdHlcIiwgMClcbiAgICAucmVtb3ZlKCk7XG5cbiAgcmV0dXJuIHN2Z0VkZ2VMYWJlbHM7XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKFwiLi9sb2Rhc2hcIiksXG4gICAgaW50ZXJzZWN0Tm9kZSA9IHJlcXVpcmUoXCIuL2ludGVyc2VjdC9pbnRlcnNlY3Qtbm9kZVwiKSxcbiAgICB1dGlsID0gcmVxdWlyZShcIi4vdXRpbFwiKSxcbiAgICBkMyA9IHJlcXVpcmUoXCIuL2QzXCIpO1xubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVFZGdlUGF0aHM7XG5cbmZ1bmN0aW9uIGNyZWF0ZUVkZ2VQYXRocyhzZWxlY3Rpb24sIGcsIGFycm93cykge1xuICB2YXIgc3ZnUGF0aHMgPSBzZWxlY3Rpb24uc2VsZWN0QWxsKFwiZy5lZGdlUGF0aFwiKVxuICAgIC5kYXRhKGcuZWRnZXMoKSwgZnVuY3Rpb24oZSkgeyByZXR1cm4gdXRpbC5lZGdlVG9JZChlKTsgfSlcbiAgICAuY2xhc3NlZChcInVwZGF0ZVwiLCB0cnVlKTtcblxuICBlbnRlcihzdmdQYXRocywgZyk7XG4gIGV4aXQoc3ZnUGF0aHMsIGcpO1xuXG4gIHV0aWwuYXBwbHlUcmFuc2l0aW9uKHN2Z1BhdGhzLCBnKVxuICAgIC5zdHlsZShcIm9wYWNpdHlcIiwgMSk7XG5cbiAgLy8gU2F2ZSBET00gZWxlbWVudCBpbiB0aGUgcGF0aCBncm91cCwgYW5kIHNldCBJRCBhbmQgY2xhc3NcbiAgc3ZnUGF0aHMuZWFjaChmdW5jdGlvbihlKSB7XG4gICAgdmFyIGRvbUVkZ2UgPSBkMy5zZWxlY3QodGhpcyk7XG4gICAgdmFyIGVkZ2UgPSBnLmVkZ2UoZSk7XG4gICAgZWRnZS5lbGVtID0gdGhpcztcblxuICAgIGlmIChlZGdlLmlkKSB7XG4gICAgICBkb21FZGdlLmF0dHIoXCJpZFwiLCBlZGdlLmlkKTtcbiAgICB9XG5cbiAgICB1dGlsLmFwcGx5Q2xhc3MoZG9tRWRnZSwgZWRnZVtcImNsYXNzXCJdLFxuICAgICAgKGRvbUVkZ2UuY2xhc3NlZChcInVwZGF0ZVwiKSA/IFwidXBkYXRlIFwiIDogXCJcIikgKyBcImVkZ2VQYXRoXCIpO1xuICB9KTtcblxuICBzdmdQYXRocy5zZWxlY3RBbGwoXCJwYXRoLnBhdGhcIilcbiAgICAuZWFjaChmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgZWRnZSA9IGcuZWRnZShlKTtcbiAgICAgIGVkZ2UuYXJyb3doZWFkSWQgPSBfLnVuaXF1ZUlkKFwiYXJyb3doZWFkXCIpO1xuXG4gICAgICB2YXIgZG9tRWRnZSA9IGQzLnNlbGVjdCh0aGlzKVxuICAgICAgICAuYXR0cihcIm1hcmtlci1lbmRcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJ1cmwoXCIgKyBtYWtlRnJhZ21lbnRSZWYobG9jYXRpb24uaHJlZiwgZWRnZS5hcnJvd2hlYWRJZCkgKyBcIilcIjtcbiAgICAgICAgfSlcbiAgICAgICAgLnN0eWxlKFwiZmlsbFwiLCBcIm5vbmVcIik7XG5cbiAgICAgIHV0aWwuYXBwbHlUcmFuc2l0aW9uKGRvbUVkZ2UsIGcpXG4gICAgICAgIC5hdHRyKFwiZFwiLCBmdW5jdGlvbihlKSB7IHJldHVybiBjYWxjUG9pbnRzKGcsIGUpOyB9KTtcblxuICAgICAgdXRpbC5hcHBseVN0eWxlKGRvbUVkZ2UsIGVkZ2Uuc3R5bGUpO1xuICAgIH0pO1xuXG4gIHN2Z1BhdGhzLnNlbGVjdEFsbChcImRlZnMgKlwiKS5yZW1vdmUoKTtcbiAgc3ZnUGF0aHMuc2VsZWN0QWxsKFwiZGVmc1wiKVxuICAgIC5lYWNoKGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciBlZGdlID0gZy5lZGdlKGUpLFxuICAgICAgICAgIGFycm93aGVhZCA9IGFycm93c1tlZGdlLmFycm93aGVhZF07XG4gICAgICBhcnJvd2hlYWQoZDMuc2VsZWN0KHRoaXMpLCBlZGdlLmFycm93aGVhZElkLCBlZGdlLCBcImFycm93aGVhZFwiKTtcbiAgICB9KTtcblxuICByZXR1cm4gc3ZnUGF0aHM7XG59XG5cbmZ1bmN0aW9uIG1ha2VGcmFnbWVudFJlZih1cmwsIGZyYWdtZW50SWQpIHtcbiAgdmFyIGJhc2VVcmwgPSB1cmwuc3BsaXQoXCIjXCIpWzBdO1xuICByZXR1cm4gYmFzZVVybCArIFwiI1wiICsgZnJhZ21lbnRJZDtcbn1cblxuZnVuY3Rpb24gY2FsY1BvaW50cyhnLCBlKSB7XG4gIHZhciBlZGdlID0gZy5lZGdlKGUpLFxuICAgICAgdGFpbCA9IGcubm9kZShlLnYpLFxuICAgICAgaGVhZCA9IGcubm9kZShlLncpLFxuICAgICAgcG9pbnRzID0gZWRnZS5wb2ludHMuc2xpY2UoMSwgZWRnZS5wb2ludHMubGVuZ3RoIC0gMSk7XG4gIHBvaW50cy51bnNoaWZ0KGludGVyc2VjdE5vZGUodGFpbCwgcG9pbnRzWzBdKSk7XG4gIHBvaW50cy5wdXNoKGludGVyc2VjdE5vZGUoaGVhZCwgcG9pbnRzW3BvaW50cy5sZW5ndGggLSAxXSkpO1xuXG4gIHJldHVybiBjcmVhdGVMaW5lKGVkZ2UsIHBvaW50cyk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUxpbmUoZWRnZSwgcG9pbnRzKSB7XG4gIHZhciBsaW5lID0gZDMuc3ZnLmxpbmUoKVxuICAgIC54KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQueDsgfSlcbiAgICAueShmdW5jdGlvbihkKSB7IHJldHVybiBkLnk7IH0pO1xuXG4gIGlmIChfLmhhcyhlZGdlLCBcImxpbmVJbnRlcnBvbGF0ZVwiKSkge1xuICAgIGxpbmUuaW50ZXJwb2xhdGUoZWRnZS5saW5lSW50ZXJwb2xhdGUpO1xuICB9XG5cbiAgaWYgKF8uaGFzKGVkZ2UsIFwibGluZVRlbnNpb25cIikpIHtcbiAgICBsaW5lLnRlbnNpb24oTnVtYmVyKGVkZ2UubGluZVRlbnNpb24pKTtcbiAgfVxuXG4gIHJldHVybiBsaW5lKHBvaW50cyk7XG59XG5cbmZ1bmN0aW9uIGdldENvb3JkcyhlbGVtKSB7XG4gIHZhciBiYm94ID0gZWxlbS5nZXRCQm94KCksXG4gICAgICBtYXRyaXggPSBlbGVtLm93bmVyU1ZHRWxlbWVudC5nZXRTY3JlZW5DVE0oKVxuICAgICAgICAuaW52ZXJzZSgpXG4gICAgICAgIC5tdWx0aXBseShlbGVtLmdldFNjcmVlbkNUTSgpKVxuICAgICAgICAudHJhbnNsYXRlKGJib3gud2lkdGggLyAyLCBiYm94LmhlaWdodCAvIDIpO1xuICByZXR1cm4geyB4OiBtYXRyaXguZSwgeTogbWF0cml4LmYgfTtcbn1cblxuZnVuY3Rpb24gZW50ZXIoc3ZnUGF0aHMsIGcpIHtcbiAgdmFyIHN2Z1BhdGhzRW50ZXIgPSBzdmdQYXRocy5lbnRlcigpXG4gICAgLmFwcGVuZChcImdcIilcbiAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJlZGdlUGF0aFwiKVxuICAgICAgLnN0eWxlKFwib3BhY2l0eVwiLCAwKTtcbiAgc3ZnUGF0aHNFbnRlci5hcHBlbmQoXCJwYXRoXCIpXG4gICAgLmF0dHIoXCJjbGFzc1wiLCBcInBhdGhcIilcbiAgICAuYXR0cihcImRcIiwgZnVuY3Rpb24oZSkge1xuICAgICAgdmFyIGVkZ2UgPSBnLmVkZ2UoZSksXG4gICAgICAgICAgc291cmNlRWxlbSA9IGcubm9kZShlLnYpLmVsZW0sXG4gICAgICAgICAgcG9pbnRzID0gXy5yYW5nZShlZGdlLnBvaW50cy5sZW5ndGgpLm1hcChmdW5jdGlvbigpIHsgcmV0dXJuIGdldENvb3Jkcyhzb3VyY2VFbGVtKTsgfSk7XG4gICAgICByZXR1cm4gY3JlYXRlTGluZShlZGdlLCBwb2ludHMpO1xuICAgIH0pO1xuICBzdmdQYXRoc0VudGVyLmFwcGVuZChcImRlZnNcIik7XG59XG5cbmZ1bmN0aW9uIGV4aXQoc3ZnUGF0aHMsIGcpIHtcbiAgdmFyIHN2Z1BhdGhFeGl0ID0gc3ZnUGF0aHMuZXhpdCgpO1xuICB1dGlsLmFwcGx5VHJhbnNpdGlvbihzdmdQYXRoRXhpdCwgZylcbiAgICAuc3R5bGUoXCJvcGFjaXR5XCIsIDApXG4gICAgLnJlbW92ZSgpO1xuXG4gIHV0aWwuYXBwbHlUcmFuc2l0aW9uKHN2Z1BhdGhFeGl0LnNlbGVjdChcInBhdGgucGF0aFwiKSwgZylcbiAgICAuYXR0cihcImRcIiwgZnVuY3Rpb24oZSkge1xuICAgICAgdmFyIHNvdXJjZSA9IGcubm9kZShlLnYpO1xuXG4gICAgICBpZiAoc291cmNlKSB7XG4gICAgICAgIHZhciBwb2ludHMgPSBfLnJhbmdlKHRoaXMuZ2V0VG90YWxMZW5ndGgoKSkubWFwKGZ1bmN0aW9uKCkgeyByZXR1cm4gc291cmNlOyB9KTtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUxpbmUoe30sIHBvaW50cyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZDMuc2VsZWN0KHRoaXMpLmF0dHIoXCJkXCIpO1xuICAgICAgfVxuICAgIH0pO1xufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZShcIi4vbG9kYXNoXCIpLFxuICAgIGFkZExhYmVsID0gcmVxdWlyZShcIi4vbGFiZWwvYWRkLWxhYmVsXCIpLFxuICAgIHV0aWwgPSByZXF1aXJlKFwiLi91dGlsXCIpLFxuICAgIGQzID0gcmVxdWlyZShcIi4vZDNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlTm9kZXM7XG5cbmZ1bmN0aW9uIGNyZWF0ZU5vZGVzKHNlbGVjdGlvbiwgZywgc2hhcGVzLCBzY2FsZSkge1xuICB2YXIgc2ltcGxlTm9kZXMgPSBnLm5vZGVzKCkuZmlsdGVyKGZ1bmN0aW9uKHYpIHsgcmV0dXJuICF1dGlsLmlzU3ViZ3JhcGgoZywgdik7IH0pO1xuICB2YXIgc3ZnTm9kZXMgPSBzZWxlY3Rpb24uc2VsZWN0QWxsKFwiZy5ub2RlXCIpXG4gICAgLmRhdGEoc2ltcGxlTm9kZXMsIGZ1bmN0aW9uKHYpIHsgcmV0dXJuIHY7IH0pXG4gICAgLmNsYXNzZWQoXCJ1cGRhdGVcIiwgdHJ1ZSk7XG5cbiAgc3ZnTm9kZXMuZXhpdCgpLnJlbW92ZSgpO1xuICBzdmdOb2Rlcy5lbnRlcigpXG4gICAgLmFwcGVuZChcImdcIilcbiAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJub2RlXCIpXG4gICAgICAuc3R5bGUoXCJvcGFjaXR5XCIsIDApO1xuICBzdmdOb2Rlcy5lYWNoKGZ1bmN0aW9uKHYpIHtcbiAgICB2YXIgdGhpc0dyb3VwID0gZDMuc2VsZWN0KHRoaXMpO1xuICAgIHZhciBub2RlID0gZy5ub2RlKHYpLFxuICAgICAgICBsYWJlbEdyb3VwID0gdGhpc0dyb3VwLmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIFwibGFiZWxcIiksXG4gICAgICAgIGxhYmVsRG9tID0gYWRkTGFiZWwobGFiZWxHcm91cCwgbm9kZSwgbnVsbCwgc2NhbGUpLFxuICAgICAgICBzaGFwZSA9IHNoYXBlc1tub2RlLnNoYXBlXSxcbiAgICAgICAgYmJveCA9IF8ucGljayhsYWJlbERvbS5ub2RlKCkuZ2V0QkJveCgpLCBcIndpZHRoXCIsIFwiaGVpZ2h0XCIpO1xuXG4gICAgbm9kZS5lbGVtID0gdGhpcztcblxuICAgIGlmIChub2RlLmlkKSB7IHRoaXNHcm91cC5hdHRyKFwiaWRcIiwgbm9kZS5pZCk7IH1cbiAgICBpZiAobm9kZS5sYWJlbElkKSB7IGxhYmVsR3JvdXAuYXR0cihcImlkXCIsIG5vZGUubGFiZWxJZCk7IH1cbiAgICB1dGlsLmFwcGx5Q2xhc3ModGhpc0dyb3VwLCBub2RlW1wiY2xhc3NcIl0sXG4gICAgICAodGhpc0dyb3VwLmNsYXNzZWQoXCJ1cGRhdGVcIikgPyBcInVwZGF0ZSBcIiA6IFwiXCIpICsgXCJub2RlXCIpO1xuXG4gICAgaWYgKF8uaGFzKG5vZGUsIFwid2lkdGhcIikpIHsgYmJveC53aWR0aCA9IG5vZGUud2lkdGg7IH1cbiAgICBpZiAoXy5oYXMobm9kZSwgXCJoZWlnaHRcIikpIHsgYmJveC5oZWlnaHQgPSBub2RlLmhlaWdodDsgfVxuXG4gICAgYmJveC53aWR0aCArPSBub2RlLnBhZGRpbmdMZWZ0ICsgbm9kZS5wYWRkaW5nUmlnaHQ7XG4gICAgYmJveC5oZWlnaHQgKz0gbm9kZS5wYWRkaW5nVG9wICsgbm9kZS5wYWRkaW5nQm90dG9tO1xuICAgIGxhYmVsR3JvdXAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArXG4gICAgICAoKG5vZGUucGFkZGluZ0xlZnQgLSBub2RlLnBhZGRpbmdSaWdodCkgLyAyKSArIFwiLFwiICtcbiAgICAgICgobm9kZS5wYWRkaW5nVG9wIC0gbm9kZS5wYWRkaW5nQm90dG9tKSAvIDIpICsgXCIpXCIpO1xuXG4gICAgdmFyIHNoYXBlU3ZnID0gc2hhcGUodGhpc0dyb3VwLCBiYm94LCBub2RlLCBzY2FsZSk7XG4gICAgdXRpbC5hcHBseVN0eWxlKHNoYXBlU3ZnLCBub2RlLnN0eWxlKTtcblxuICAgIHZhciBzaGFwZUJCb3ggPSBzaGFwZVN2Zy5ub2RlKCkuZ2V0QkJveCgpO1xuICAgIG5vZGUud2lkdGggPSBzaGFwZUJCb3gud2lkdGg7XG4gICAgbm9kZS5oZWlnaHQgPSBzaGFwZUJCb3guaGVpZ2h0O1xuICB9KTtcblxuICB1dGlsLmFwcGx5VHJhbnNpdGlvbihzdmdOb2Rlcy5leGl0KCksIGcpXG4gICAgLnN0eWxlKFwib3BhY2l0eVwiLCAwKVxuICAgIC5yZW1vdmUoKTtcblxuICByZXR1cm4gc3ZnTm9kZXM7XG59XG4iLCIvLyBTdHViIHRvIGdldCBEMyBlaXRoZXIgdmlhIE5QTSBvciBmcm9tIHRoZSBnbG9iYWwgb2JqZWN0XG5tb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy5kMztcbiIsIi8qIGdsb2JhbCB3aW5kb3cgKi9cblxudmFyIGRhZ3JlO1xuXG5pZiAocmVxdWlyZSkge1xuICB0cnkge1xuICAgIGRhZ3JlID0gcmVxdWlyZShcImRhZ3JlXCIpO1xuICB9IGNhdGNoIChlKSB7fVxufVxuXG5pZiAoIWRhZ3JlKSB7XG4gIGRhZ3JlID0gd2luZG93LmRhZ3JlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRhZ3JlO1xuIiwiLyogZ2xvYmFsIHdpbmRvdyAqL1xuXG52YXIgZ3JhcGhsaWI7XG5cbmlmIChyZXF1aXJlKSB7XG4gIHRyeSB7XG4gICAgZ3JhcGhsaWIgPSByZXF1aXJlKFwiZ3JhcGhsaWJcIik7XG4gIH0gY2F0Y2ggKGUpIHt9XG59XG5cbmlmICghZ3JhcGhsaWIpIHtcbiAgZ3JhcGhsaWIgPSB3aW5kb3cuZ3JhcGhsaWI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ3JhcGhsaWI7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgbm9kZTogcmVxdWlyZShcIi4vaW50ZXJzZWN0LW5vZGVcIiksXG4gIGNpcmNsZTogcmVxdWlyZShcIi4vaW50ZXJzZWN0LWNpcmNsZVwiKSxcbiAgZWxsaXBzZTogcmVxdWlyZShcIi4vaW50ZXJzZWN0LWVsbGlwc2VcIiksXG4gIHBvbHlnb246IHJlcXVpcmUoXCIuL2ludGVyc2VjdC1wb2x5Z29uXCIpLFxuICByZWN0OiByZXF1aXJlKFwiLi9pbnRlcnNlY3QtcmVjdFwiKVxufTtcbiIsInZhciBpbnRlcnNlY3RFbGxpcHNlID0gcmVxdWlyZShcIi4vaW50ZXJzZWN0LWVsbGlwc2VcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gaW50ZXJzZWN0Q2lyY2xlO1xuXG5mdW5jdGlvbiBpbnRlcnNlY3RDaXJjbGUobm9kZSwgcngsIHBvaW50KSB7XG4gIHJldHVybiBpbnRlcnNlY3RFbGxpcHNlKG5vZGUsIHJ4LCByeCwgcG9pbnQpO1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBpbnRlcnNlY3RFbGxpcHNlO1xuXG5mdW5jdGlvbiBpbnRlcnNlY3RFbGxpcHNlKG5vZGUsIHJ4LCByeSwgcG9pbnQpIHtcbiAgLy8gRm9ybXVsYWUgZnJvbTogaHR0cDovL21hdGh3b3JsZC53b2xmcmFtLmNvbS9FbGxpcHNlLUxpbmVJbnRlcnNlY3Rpb24uaHRtbFxuXG4gIHZhciBjeCA9IG5vZGUueDtcbiAgdmFyIGN5ID0gbm9kZS55O1xuXG4gIHZhciBweCA9IGN4IC0gcG9pbnQueDtcbiAgdmFyIHB5ID0gY3kgLSBwb2ludC55O1xuXG4gIHZhciBkZXQgPSBNYXRoLnNxcnQocnggKiByeCAqIHB5ICogcHkgKyByeSAqIHJ5ICogcHggKiBweCk7XG5cbiAgdmFyIGR4ID0gTWF0aC5hYnMocnggKiByeSAqIHB4IC8gZGV0KTtcbiAgaWYgKHBvaW50LnggPCBjeCkge1xuICAgIGR4ID0gLWR4O1xuICB9XG4gIHZhciBkeSA9IE1hdGguYWJzKHJ4ICogcnkgKiBweSAvIGRldCk7XG4gIGlmIChwb2ludC55IDwgY3kpIHtcbiAgICBkeSA9IC1keTtcbiAgfVxuXG4gIHJldHVybiB7eDogY3ggKyBkeCwgeTogY3kgKyBkeX07XG59XG5cbiIsIm1vZHVsZS5leHBvcnRzID0gaW50ZXJzZWN0TGluZTtcblxuLypcbiAqIFJldHVybnMgdGhlIHBvaW50IGF0IHdoaWNoIHR3byBsaW5lcywgcCBhbmQgcSwgaW50ZXJzZWN0IG9yIHJldHVybnNcbiAqIHVuZGVmaW5lZCBpZiB0aGV5IGRvIG5vdCBpbnRlcnNlY3QuXG4gKi9cbmZ1bmN0aW9uIGludGVyc2VjdExpbmUocDEsIHAyLCBxMSwgcTIpIHtcbiAgLy8gQWxnb3JpdGhtIGZyb20gSi4gQXZybywgKGVkLikgR3JhcGhpY3MgR2VtcywgTm8gMiwgTW9yZ2FuIEthdWZtYW5uLCAxOTk0LFxuICAvLyBwNyBhbmQgcDQ3My5cblxuICB2YXIgYTEsIGEyLCBiMSwgYjIsIGMxLCBjMjtcbiAgdmFyIHIxLCByMiAsIHIzLCByNDtcbiAgdmFyIGRlbm9tLCBvZmZzZXQsIG51bTtcbiAgdmFyIHgsIHk7XG5cbiAgLy8gQ29tcHV0ZSBhMSwgYjEsIGMxLCB3aGVyZSBsaW5lIGpvaW5pbmcgcG9pbnRzIDEgYW5kIDIgaXMgRih4LHkpID0gYTEgeCArXG4gIC8vIGIxIHkgKyBjMSA9IDAuXG4gIGExID0gcDIueSAtIHAxLnk7XG4gIGIxID0gcDEueCAtIHAyLng7XG4gIGMxID0gKHAyLnggKiBwMS55KSAtIChwMS54ICogcDIueSk7XG5cbiAgLy8gQ29tcHV0ZSByMyBhbmQgcjQuXG4gIHIzID0gKChhMSAqIHExLngpICsgKGIxICogcTEueSkgKyBjMSk7XG4gIHI0ID0gKChhMSAqIHEyLngpICsgKGIxICogcTIueSkgKyBjMSk7XG5cbiAgLy8gQ2hlY2sgc2lnbnMgb2YgcjMgYW5kIHI0LiBJZiBib3RoIHBvaW50IDMgYW5kIHBvaW50IDQgbGllIG9uXG4gIC8vIHNhbWUgc2lkZSBvZiBsaW5lIDEsIHRoZSBsaW5lIHNlZ21lbnRzIGRvIG5vdCBpbnRlcnNlY3QuXG4gIGlmICgocjMgIT09IDApICYmIChyNCAhPT0gMCkgJiYgc2FtZVNpZ24ocjMsIHI0KSkge1xuICAgIHJldHVybiAvKkRPTlRfSU5URVJTRUNUKi87XG4gIH1cblxuICAvLyBDb21wdXRlIGEyLCBiMiwgYzIgd2hlcmUgbGluZSBqb2luaW5nIHBvaW50cyAzIGFuZCA0IGlzIEcoeCx5KSA9IGEyIHggKyBiMiB5ICsgYzIgPSAwXG4gIGEyID0gcTIueSAtIHExLnk7XG4gIGIyID0gcTEueCAtIHEyLng7XG4gIGMyID0gKHEyLnggKiBxMS55KSAtIChxMS54ICogcTIueSk7XG5cbiAgLy8gQ29tcHV0ZSByMSBhbmQgcjJcbiAgcjEgPSAoYTIgKiBwMS54KSArIChiMiAqIHAxLnkpICsgYzI7XG4gIHIyID0gKGEyICogcDIueCkgKyAoYjIgKiBwMi55KSArIGMyO1xuXG4gIC8vIENoZWNrIHNpZ25zIG9mIHIxIGFuZCByMi4gSWYgYm90aCBwb2ludCAxIGFuZCBwb2ludCAyIGxpZVxuICAvLyBvbiBzYW1lIHNpZGUgb2Ygc2Vjb25kIGxpbmUgc2VnbWVudCwgdGhlIGxpbmUgc2VnbWVudHMgZG9cbiAgLy8gbm90IGludGVyc2VjdC5cbiAgaWYgKChyMSAhPT0gMCkgJiYgKHIyICE9PSAwKSAmJiAoc2FtZVNpZ24ocjEsIHIyKSkpIHtcbiAgICByZXR1cm4gLypET05UX0lOVEVSU0VDVCovO1xuICB9XG5cbiAgLy8gTGluZSBzZWdtZW50cyBpbnRlcnNlY3Q6IGNvbXB1dGUgaW50ZXJzZWN0aW9uIHBvaW50LlxuICBkZW5vbSA9IChhMSAqIGIyKSAtIChhMiAqIGIxKTtcbiAgaWYgKGRlbm9tID09PSAwKSB7XG4gICAgcmV0dXJuIC8qQ09MTElORUFSKi87XG4gIH1cblxuICBvZmZzZXQgPSBNYXRoLmFicyhkZW5vbSAvIDIpO1xuXG4gIC8vIFRoZSBkZW5vbS8yIGlzIHRvIGdldCByb3VuZGluZyBpbnN0ZWFkIG9mIHRydW5jYXRpbmcuIEl0XG4gIC8vIGlzIGFkZGVkIG9yIHN1YnRyYWN0ZWQgdG8gdGhlIG51bWVyYXRvciwgZGVwZW5kaW5nIHVwb24gdGhlXG4gIC8vIHNpZ24gb2YgdGhlIG51bWVyYXRvci5cbiAgbnVtID0gKGIxICogYzIpIC0gKGIyICogYzEpO1xuICB4ID0gKG51bSA8IDApID8gKChudW0gLSBvZmZzZXQpIC8gZGVub20pIDogKChudW0gKyBvZmZzZXQpIC8gZGVub20pO1xuXG4gIG51bSA9IChhMiAqIGMxKSAtIChhMSAqIGMyKTtcbiAgeSA9IChudW0gPCAwKSA/ICgobnVtIC0gb2Zmc2V0KSAvIGRlbm9tKSA6ICgobnVtICsgb2Zmc2V0KSAvIGRlbm9tKTtcblxuICByZXR1cm4geyB4OiB4LCB5OiB5IH07XG59XG5cbmZ1bmN0aW9uIHNhbWVTaWduKHIxLCByMikge1xuICByZXR1cm4gcjEgKiByMiA+IDA7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGludGVyc2VjdE5vZGU7XG5cbmZ1bmN0aW9uIGludGVyc2VjdE5vZGUobm9kZSwgcG9pbnQpIHtcbiAgcmV0dXJuIG5vZGUuaW50ZXJzZWN0KHBvaW50KTtcbn1cbiIsInZhciBpbnRlcnNlY3RMaW5lID0gcmVxdWlyZShcIi4vaW50ZXJzZWN0LWxpbmVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gaW50ZXJzZWN0UG9seWdvbjtcblxuLypcbiAqIFJldHVybnMgdGhlIHBvaW50ICh7eCwgeX0pIGF0IHdoaWNoIHRoZSBwb2ludCBhcmd1bWVudCBpbnRlcnNlY3RzIHdpdGggdGhlXG4gKiBub2RlIGFyZ3VtZW50IGFzc3VtaW5nIHRoYXQgaXQgaGFzIHRoZSBzaGFwZSBzcGVjaWZpZWQgYnkgcG9seWdvbi5cbiAqL1xuZnVuY3Rpb24gaW50ZXJzZWN0UG9seWdvbihub2RlLCBwb2x5UG9pbnRzLCBwb2ludCkge1xuICB2YXIgeDEgPSBub2RlLng7XG4gIHZhciB5MSA9IG5vZGUueTtcblxuICB2YXIgaW50ZXJzZWN0aW9ucyA9IFtdO1xuXG4gIHZhciBtaW5YID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLFxuICAgICAgbWluWSA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgcG9seVBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVudHJ5KSB7XG4gICAgbWluWCA9IE1hdGgubWluKG1pblgsIGVudHJ5LngpO1xuICAgIG1pblkgPSBNYXRoLm1pbihtaW5ZLCBlbnRyeS55KTtcbiAgfSk7XG5cbiAgdmFyIGxlZnQgPSB4MSAtIG5vZGUud2lkdGggLyAyIC0gbWluWDtcbiAgdmFyIHRvcCA9ICB5MSAtIG5vZGUuaGVpZ2h0IC8gMiAtIG1pblk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwb2x5UG9pbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHAxID0gcG9seVBvaW50c1tpXTtcbiAgICB2YXIgcDIgPSBwb2x5UG9pbnRzW2kgPCBwb2x5UG9pbnRzLmxlbmd0aCAtIDEgPyBpICsgMSA6IDBdO1xuICAgIHZhciBpbnRlcnNlY3QgPSBpbnRlcnNlY3RMaW5lKG5vZGUsIHBvaW50LFxuICAgICAge3g6IGxlZnQgKyBwMS54LCB5OiB0b3AgKyBwMS55fSwge3g6IGxlZnQgKyBwMi54LCB5OiB0b3AgKyBwMi55fSk7XG4gICAgaWYgKGludGVyc2VjdCkge1xuICAgICAgaW50ZXJzZWN0aW9ucy5wdXNoKGludGVyc2VjdCk7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFpbnRlcnNlY3Rpb25zLmxlbmd0aCkge1xuICAgIGNvbnNvbGUubG9nKFwiTk8gSU5URVJTRUNUSU9OIEZPVU5ELCBSRVRVUk4gTk9ERSBDRU5URVJcIiwgbm9kZSk7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBpZiAoaW50ZXJzZWN0aW9ucy5sZW5ndGggPiAxKSB7XG4gICAgLy8gTW9yZSBpbnRlcnNlY3Rpb25zLCBmaW5kIHRoZSBvbmUgbmVhcmVzdCB0byBlZGdlIGVuZCBwb2ludFxuICAgIGludGVyc2VjdGlvbnMuc29ydChmdW5jdGlvbihwLCBxKSB7XG4gICAgICB2YXIgcGR4ID0gcC54IC0gcG9pbnQueCxcbiAgICAgICAgICBwZHkgPSBwLnkgLSBwb2ludC55LFxuICAgICAgICAgIGRpc3RwID0gTWF0aC5zcXJ0KHBkeCAqIHBkeCArIHBkeSAqIHBkeSksXG5cbiAgICAgICAgICBxZHggPSBxLnggLSBwb2ludC54LFxuICAgICAgICAgIHFkeSA9IHEueSAtIHBvaW50LnksXG4gICAgICAgICAgZGlzdHEgPSBNYXRoLnNxcnQocWR4ICogcWR4ICsgcWR5ICogcWR5KTtcblxuICAgICAgcmV0dXJuIChkaXN0cCA8IGRpc3RxKSA/IC0xIDogKGRpc3RwID09PSBkaXN0cSA/IDAgOiAxKTtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gaW50ZXJzZWN0aW9uc1swXTtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gaW50ZXJzZWN0UmVjdDtcblxuZnVuY3Rpb24gaW50ZXJzZWN0UmVjdChub2RlLCBwb2ludCkge1xuICB2YXIgeCA9IG5vZGUueDtcbiAgdmFyIHkgPSBub2RlLnk7XG5cbiAgLy8gUmVjdGFuZ2xlIGludGVyc2VjdGlvbiBhbGdvcml0aG0gZnJvbTpcbiAgLy8gaHR0cDovL21hdGguc3RhY2tleGNoYW5nZS5jb20vcXVlc3Rpb25zLzEwODExMy9maW5kLWVkZ2UtYmV0d2Vlbi10d28tYm94ZXNcbiAgdmFyIGR4ID0gcG9pbnQueCAtIHg7XG4gIHZhciBkeSA9IHBvaW50LnkgLSB5O1xuICB2YXIgdyA9IG5vZGUud2lkdGggLyAyO1xuICB2YXIgaCA9IG5vZGUuaGVpZ2h0IC8gMjtcblxuICB2YXIgc3gsIHN5O1xuICBpZiAoTWF0aC5hYnMoZHkpICogdyA+IE1hdGguYWJzKGR4KSAqIGgpIHtcbiAgICAvLyBJbnRlcnNlY3Rpb24gaXMgdG9wIG9yIGJvdHRvbSBvZiByZWN0LlxuICAgIGlmIChkeSA8IDApIHtcbiAgICAgIGggPSAtaDtcbiAgICB9XG4gICAgc3ggPSBkeSA9PT0gMCA/IDAgOiBoICogZHggLyBkeTtcbiAgICBzeSA9IGg7XG4gIH0gZWxzZSB7XG4gICAgLy8gSW50ZXJzZWN0aW9uIGlzIGxlZnQgb3IgcmlnaHQgb2YgcmVjdC5cbiAgICBpZiAoZHggPCAwKSB7XG4gICAgICB3ID0gLXc7XG4gICAgfVxuICAgIHN4ID0gdztcbiAgICBzeSA9IGR4ID09PSAwID8gMCA6IHcgKiBkeSAvIGR4O1xuICB9XG5cbiAgcmV0dXJuIHt4OiB4ICsgc3gsIHk6IHkgKyBzeX07XG59XG4iLCJ2YXIgdXRpbCA9IHJlcXVpcmUoXCIuLi91dGlsXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFkZEh0bWxMYWJlbDtcblxuZnVuY3Rpb24gYWRkSHRtbExhYmVsKHJvb3QsIG5vZGUpIHtcbiAgdmFyIGZvID0gcm9vdFxuICAgIC5hcHBlbmQoXCJmb3JlaWduT2JqZWN0XCIpXG4gICAgICAuYXR0cihcIndpZHRoXCIsIFwiMTAwMDAwXCIpO1xuXG4gIHZhciBkaXYgPSBmb1xuICAgIC5hcHBlbmQoXCJ4aHRtbDpkaXZcIik7XG4gIGRpdi5hdHRyKFwieG1sbnNcIiwgXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIpO1xuXG4gIHZhciBsYWJlbCA9IG5vZGUubGFiZWw7XG4gIHN3aXRjaCh0eXBlb2YgbGFiZWwpIHtcbiAgICBjYXNlIFwiZnVuY3Rpb25cIjpcbiAgICAgIGRpdi5pbnNlcnQobGFiZWwpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcIm9iamVjdFwiOlxuICAgICAgLy8gQ3VycmVudGx5IHdlIGFzc3VtZSB0aGlzIGlzIGEgRE9NIG9iamVjdC5cbiAgICAgIGRpdi5pbnNlcnQoZnVuY3Rpb24oKSB7IHJldHVybiBsYWJlbDsgfSk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OiBkaXYuaHRtbChsYWJlbCk7XG4gIH1cblxuICB1dGlsLmFwcGx5U3R5bGUoZGl2LCBub2RlLmxhYmVsU3R5bGUpO1xuICBkaXYuc3R5bGUoXCJkaXNwbGF5XCIsIFwiaW5saW5lLWJsb2NrXCIpO1xuICAvLyBGaXggZm9yIGZpcmVmb3hcbiAgZGl2LnN0eWxlKFwid2hpdGUtc3BhY2VcIiwgXCJub3dyYXBcIik7XG5cbiAgLy92YXIgY2xpZW50ID0gZGl2WzBdWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAvL2ZvXG4gIC8vICAuYXR0cihcIndpZHRoXCIsIGNsaWVudC53aWR0aCAqICgxL3NjYWxlKSlcbiAgLy8gIC5hdHRyKFwiaGVpZ2h0XCIsIGNsaWVudC5oZWlnaHQgKiAoMS9zY2FsZSkpO1xuICAvL1xuICAvL3JldHVybiBmbztcbiAgdmFyIHcsIGg7XG4gIGRpdlxuICAgICAgLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHcgPSB0aGlzLmNsaWVudFdpZHRoO1xuICAgICAgICBoID0gdGhpcy5jbGllbnRIZWlnaHQ7XG4gICAgICB9KTtcblxuICBmb1xuICAgICAgLmF0dHIoXCJ3aWR0aFwiLCB3KVxuICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgaCk7XG5cbiAgcmV0dXJuIGZvO1xufVxuIiwidmFyIGFkZFRleHRMYWJlbCA9IHJlcXVpcmUoXCIuL2FkZC10ZXh0LWxhYmVsXCIpLFxuICAgIGFkZEh0bWxMYWJlbCA9IHJlcXVpcmUoXCIuL2FkZC1odG1sLWxhYmVsXCIpLFxuICAgIGFkZFNWR0xhYmVsICA9IHJlcXVpcmUoXCIuL2FkZC1zdmctbGFiZWxcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gYWRkTGFiZWw7XG5cbmZ1bmN0aW9uIGFkZExhYmVsKHJvb3QsIG5vZGUsIGxvY2F0aW9uLCBzY2FsZSkge1xuICB2YXIgbGFiZWwgPSBub2RlLmxhYmVsO1xuICB2YXIgbGFiZWxTdmcgPSByb290LmFwcGVuZChcImdcIik7XG5cbiAgLy8gQWxsb3cgdGhlIGxhYmVsIHRvIGJlIGEgc3RyaW5nLCBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIERPTSBlbGVtZW50LCBvclxuICAvLyBhIERPTSBlbGVtZW50IGl0c2VsZi5cbiAgaWYgKG5vZGUubGFiZWxUeXBlID09PSBcInN2Z1wiKSB7XG4gICAgYWRkU1ZHTGFiZWwobGFiZWxTdmcsIG5vZGUpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBsYWJlbCAhPT0gXCJzdHJpbmdcIiB8fCBub2RlLmxhYmVsVHlwZSA9PT0gXCJodG1sXCIpIHtcbiAgICBhZGRIdG1sTGFiZWwobGFiZWxTdmcsIG5vZGUsIHNjYWxlKTtcbiAgfSBlbHNlIHtcbiAgICBhZGRUZXh0TGFiZWwobGFiZWxTdmcsIG5vZGUpO1xuICB9XG5cbiAgdmFyIGxhYmVsQkJveCA9IGxhYmVsU3ZnLm5vZGUoKS5nZXRCQm94KCk7XG4gIHZhciB5O1xuICBzd2l0Y2gobG9jYXRpb24pIHtcbiAgICBjYXNlIFwidG9wXCI6XG4gICAgICB5ID0gKC1ub2RlLmhlaWdodCAvIDIpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcImJvdHRvbVwiOlxuICAgICAgeSA9IChub2RlLmhlaWdodCAvIDIpIC0gbGFiZWxCQm94LmhlaWdodDtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB5ID0gKC1sYWJlbEJCb3guaGVpZ2h0IC8gMik7XG4gIH1cbiAgbGFiZWxTdmcuYXR0cihcInRyYW5zZm9ybVwiLFxuICAgICAgICAgICAgICAgIFwidHJhbnNsYXRlKFwiICsgKC1sYWJlbEJCb3gud2lkdGggLyAyKSArIFwiLFwiICsgeSArIFwiKVwiKTtcblxuICByZXR1cm4gbGFiZWxTdmc7XG59XG4iLCJ2YXIgdXRpbCA9IHJlcXVpcmUoXCIuLi91dGlsXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFkZFNWR0xhYmVsO1xuXG5mdW5jdGlvbiBhZGRTVkdMYWJlbChyb290LCBub2RlKSB7XG4gIHZhciBkb21Ob2RlID0gcm9vdDtcblxuICBkb21Ob2RlLm5vZGUoKS5hcHBlbmRDaGlsZChub2RlLmxhYmVsKTtcblxuICB1dGlsLmFwcGx5U3R5bGUoZG9tTm9kZSwgbm9kZS5sYWJlbFN0eWxlKTtcblxuICByZXR1cm4gZG9tTm9kZTtcbn1cbiIsInZhciB1dGlsID0gcmVxdWlyZShcIi4uL3V0aWxcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gYWRkVGV4dExhYmVsO1xuXG4vKlxuICogQXR0YWNoZXMgYSB0ZXh0IGxhYmVsIHRvIHRoZSBzcGVjaWZpZWQgcm9vdC4gSGFuZGxlcyBlc2NhcGUgc2VxdWVuY2VzLlxuICovXG5mdW5jdGlvbiBhZGRUZXh0TGFiZWwocm9vdCwgbm9kZSkge1xuICB2YXIgZG9tTm9kZSA9IHJvb3QuYXBwZW5kKFwidGV4dFwiKTtcblxuICB2YXIgbGluZXMgPSBwcm9jZXNzRXNjYXBlU2VxdWVuY2VzKG5vZGUubGFiZWwpLnNwbGl0KFwiXFxuXCIpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgZG9tTm9kZVxuICAgICAgLmFwcGVuZChcInRzcGFuXCIpXG4gICAgICAgIC5hdHRyKFwieG1sOnNwYWNlXCIsIFwicHJlc2VydmVcIilcbiAgICAgICAgLmF0dHIoXCJkeVwiLCBcIjFlbVwiKVxuICAgICAgICAuYXR0cihcInhcIiwgXCIxXCIpXG4gICAgICAgIC50ZXh0KGxpbmVzW2ldKTtcbiAgfVxuXG4gIHV0aWwuYXBwbHlTdHlsZShkb21Ob2RlLCBub2RlLmxhYmVsU3R5bGUpO1xuXG4gIHJldHVybiBkb21Ob2RlO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzRXNjYXBlU2VxdWVuY2VzKHRleHQpIHtcbiAgdmFyIG5ld1RleHQgPSBcIlwiLFxuICAgICAgZXNjYXBlZCA9IGZhbHNlLFxuICAgICAgY2g7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGV4dC5sZW5ndGg7ICsraSkge1xuICAgIGNoID0gdGV4dFtpXTtcbiAgICBpZiAoZXNjYXBlZCkge1xuICAgICAgc3dpdGNoKGNoKSB7XG4gICAgICAgIGNhc2UgXCJuXCI6IG5ld1RleHQgKz0gXCJcXG5cIjsgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6IG5ld1RleHQgKz0gY2g7XG4gICAgICB9XG4gICAgICBlc2NhcGVkID0gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChjaCA9PT0gXCJcXFxcXCIpIHtcbiAgICAgIGVzY2FwZWQgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXdUZXh0ICs9IGNoO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbmV3VGV4dDtcbn1cbiIsIi8qIGdsb2JhbCB3aW5kb3cgKi9cblxudmFyIGxvZGFzaDtcblxuaWYgKHJlcXVpcmUpIHtcbiAgdHJ5IHtcbiAgICBsb2Rhc2ggPSByZXF1aXJlKFwibG9kYXNoXCIpO1xuICB9IGNhdGNoIChlKSB7fVxufVxuXG5pZiAoIWxvZGFzaCkge1xuICBsb2Rhc2ggPSB3aW5kb3cuXztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsb2Rhc2g7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHV0aWwgPSByZXF1aXJlKFwiLi91dGlsXCIpLFxuICAgIGQzID0gcmVxdWlyZShcIi4vZDNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gcG9zaXRpb25DbHVzdGVycztcblxuZnVuY3Rpb24gcG9zaXRpb25DbHVzdGVycyhzZWxlY3Rpb24sIGcpIHtcbiAgdmFyIGNyZWF0ZWQgPSBzZWxlY3Rpb24uZmlsdGVyKGZ1bmN0aW9uKCkgeyByZXR1cm4gIWQzLnNlbGVjdCh0aGlzKS5jbGFzc2VkKFwidXBkYXRlXCIpOyB9KTtcblxuICBmdW5jdGlvbiB0cmFuc2xhdGUodikge1xuICAgIHZhciBub2RlID0gZy5ub2RlKHYpO1xuICAgIHJldHVybiBcInRyYW5zbGF0ZShcIiArIG5vZGUueCArIFwiLFwiICsgbm9kZS55ICsgXCIpXCI7XG4gIH1cblxuICBjcmVhdGVkLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgdHJhbnNsYXRlKTtcblxuICB1dGlsLmFwcGx5VHJhbnNpdGlvbihzZWxlY3Rpb24sIGcpXG4gICAgICAuc3R5bGUoXCJvcGFjaXR5XCIsIDEpXG4gICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCB0cmFuc2xhdGUpO1xuXG4gIHV0aWwuYXBwbHlUcmFuc2l0aW9uKGNyZWF0ZWQuc2VsZWN0QWxsKFwicmVjdFwiKSwgZylcbiAgICAgIC5hdHRyKFwid2lkdGhcIiwgZnVuY3Rpb24odikgeyByZXR1cm4gZy5ub2RlKHYpLndpZHRoOyB9KVxuICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgZnVuY3Rpb24odikgeyByZXR1cm4gZy5ub2RlKHYpLmhlaWdodDsgfSlcbiAgICAgIC5hdHRyKFwieFwiLCBmdW5jdGlvbih2KSB7XG4gICAgICAgIHZhciBub2RlID0gZy5ub2RlKHYpO1xuICAgICAgICByZXR1cm4gLW5vZGUud2lkdGggLyAyO1xuICAgICAgfSlcbiAgICAgIC5hdHRyKFwieVwiLCBmdW5jdGlvbih2KSB7XG4gICAgICAgIHZhciBub2RlID0gZy5ub2RlKHYpO1xuICAgICAgICByZXR1cm4gLW5vZGUuaGVpZ2h0IC8gMjtcbiAgICAgIH0pO1xuXG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHV0aWwgPSByZXF1aXJlKFwiLi91dGlsXCIpLFxuICAgIGQzID0gcmVxdWlyZShcIi4vZDNcIiksXG4gICAgXyA9IHJlcXVpcmUoXCIuL2xvZGFzaFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBwb3NpdGlvbkVkZ2VMYWJlbHM7XG5cbmZ1bmN0aW9uIHBvc2l0aW9uRWRnZUxhYmVscyhzZWxlY3Rpb24sIGcpIHtcbiAgdmFyIGNyZWF0ZWQgPSBzZWxlY3Rpb24uZmlsdGVyKGZ1bmN0aW9uKCkgeyByZXR1cm4gIWQzLnNlbGVjdCh0aGlzKS5jbGFzc2VkKFwidXBkYXRlXCIpOyB9KTtcblxuICBmdW5jdGlvbiB0cmFuc2xhdGUoZSkge1xuICAgIHZhciBlZGdlID0gZy5lZGdlKGUpO1xuICAgIHJldHVybiBfLmhhcyhlZGdlLCBcInhcIikgPyBcInRyYW5zbGF0ZShcIiArIGVkZ2UueCArIFwiLFwiICsgZWRnZS55ICsgXCIpXCIgOiBcIlwiO1xuICB9XG5cbiAgY3JlYXRlZC5hdHRyKFwidHJhbnNmb3JtXCIsIHRyYW5zbGF0ZSk7XG5cbiAgdXRpbC5hcHBseVRyYW5zaXRpb24oc2VsZWN0aW9uLCBnKVxuICAgIC5zdHlsZShcIm9wYWNpdHlcIiwgMSlcbiAgICAuYXR0cihcInRyYW5zZm9ybVwiLCB0cmFuc2xhdGUpO1xufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciB1dGlsID0gcmVxdWlyZShcIi4vdXRpbFwiKSxcbiAgICBkMyA9IHJlcXVpcmUoXCIuL2QzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBvc2l0aW9uTm9kZXM7XG5cbmZ1bmN0aW9uIHBvc2l0aW9uTm9kZXMoc2VsZWN0aW9uLCBnKSB7XG4gIHZhciBjcmVhdGVkID0gc2VsZWN0aW9uLmZpbHRlcihmdW5jdGlvbigpIHsgcmV0dXJuICFkMy5zZWxlY3QodGhpcykuY2xhc3NlZChcInVwZGF0ZVwiKTsgfSk7XG5cbiAgZnVuY3Rpb24gdHJhbnNsYXRlKHYpIHtcbiAgICB2YXIgbm9kZSA9IGcubm9kZSh2KTtcbiAgICByZXR1cm4gXCJ0cmFuc2xhdGUoXCIgKyBub2RlLnggKyBcIixcIiArIG5vZGUueSArIFwiKVwiO1xuICB9XG5cbiAgY3JlYXRlZC5hdHRyKFwidHJhbnNmb3JtXCIsIHRyYW5zbGF0ZSk7XG5cbiAgdXRpbC5hcHBseVRyYW5zaXRpb24oc2VsZWN0aW9uLCBnKVxuICAgIC5zdHlsZShcIm9wYWNpdHlcIiwgMSlcbiAgICAuYXR0cihcInRyYW5zZm9ybVwiLCB0cmFuc2xhdGUpO1xufVxuIiwidmFyIF8gPSByZXF1aXJlKFwiLi9sb2Rhc2hcIiksXG4gICAgbGF5b3V0ID0gcmVxdWlyZShcIi4vZGFncmVcIikubGF5b3V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlbmRlcjtcblxuLy8gVGhpcyBkZXNpZ24gaXMgYmFzZWQgb24gaHR0cDovL2Jvc3Qub2Nrcy5vcmcvbWlrZS9jaGFydC8uXG5mdW5jdGlvbiByZW5kZXIoc2NhbGUpIHtcbiAgaWYoIXNjYWxlKSBzY2FsZSA9IDE7XG4gIHZhciBjcmVhdGVOb2RlcyA9IHJlcXVpcmUoXCIuL2NyZWF0ZS1ub2Rlc1wiKSxcbiAgICAgIGNyZWF0ZUNsdXN0ZXJzID0gcmVxdWlyZShcIi4vY3JlYXRlLWNsdXN0ZXJzXCIpLFxuICAgICAgY3JlYXRlRWRnZUxhYmVscyA9IHJlcXVpcmUoXCIuL2NyZWF0ZS1lZGdlLWxhYmVsc1wiKSxcbiAgICAgIGNyZWF0ZUVkZ2VQYXRocyA9IHJlcXVpcmUoXCIuL2NyZWF0ZS1lZGdlLXBhdGhzXCIpLFxuICAgICAgcG9zaXRpb25Ob2RlcyA9IHJlcXVpcmUoXCIuL3Bvc2l0aW9uLW5vZGVzXCIpLFxuICAgICAgcG9zaXRpb25FZGdlTGFiZWxzID0gcmVxdWlyZShcIi4vcG9zaXRpb24tZWRnZS1sYWJlbHNcIiksXG4gICAgICBwb3NpdGlvbkNsdXN0ZXJzID0gcmVxdWlyZShcIi4vcG9zaXRpb24tY2x1c3RlcnNcIiksXG4gICAgICBzaGFwZXMgPSByZXF1aXJlKFwiLi9zaGFwZXNcIiksXG4gICAgICBhcnJvd3MgPSByZXF1aXJlKFwiLi9hcnJvd3NcIik7XG5cbiAgdmFyIGZuID0gZnVuY3Rpb24oc3ZnLCBnKSB7XG4gICAgcHJlUHJvY2Vzc0dyYXBoKGcpO1xuXG4gICAgdmFyIG91dHB1dEdyb3VwID0gY3JlYXRlT3JTZWxlY3RHcm91cChzdmcsIFwib3V0cHV0XCIpLFxuICAgICAgICBjbHVzdGVyc0dyb3VwID0gY3JlYXRlT3JTZWxlY3RHcm91cChvdXRwdXRHcm91cCwgXCJjbHVzdGVyc1wiKSxcbiAgICAgICAgZWRnZVBhdGhzR3JvdXAgPSBjcmVhdGVPclNlbGVjdEdyb3VwKG91dHB1dEdyb3VwLCBcImVkZ2VQYXRoc1wiKSxcbiAgICAgICAgZWRnZUxhYmVscyA9IGNyZWF0ZUVkZ2VMYWJlbHMoY3JlYXRlT3JTZWxlY3RHcm91cChvdXRwdXRHcm91cCwgXCJlZGdlTGFiZWxzXCIpLCBnKSxcbiAgICAgICAgbm9kZXMgPSBjcmVhdGVOb2RlcyhjcmVhdGVPclNlbGVjdEdyb3VwKG91dHB1dEdyb3VwLCBcIm5vZGVzXCIpLCBnLCBzaGFwZXMsIHNjYWxlKTtcblxuICAgIGxheW91dChnKTtcblxuICAgIHBvc2l0aW9uTm9kZXMobm9kZXMsIGcpO1xuICAgIHBvc2l0aW9uRWRnZUxhYmVscyhlZGdlTGFiZWxzLCBnKTtcbiAgICBjcmVhdGVFZGdlUGF0aHMoZWRnZVBhdGhzR3JvdXAsIGcsIGFycm93cyk7XG5cbiAgICB2YXIgY2x1c3RlcnMgPSBjcmVhdGVDbHVzdGVycyhjbHVzdGVyc0dyb3VwLCBnKTtcbiAgICBwb3NpdGlvbkNsdXN0ZXJzKGNsdXN0ZXJzLCBnKTtcblxuICAgIHBvc3RQcm9jZXNzR3JhcGgoZyk7XG4gIH07XG5cbiAgZm4uY3JlYXRlTm9kZXMgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGNyZWF0ZU5vZGVzO1xuICAgIGNyZWF0ZU5vZGVzID0gdmFsdWU7XG4gICAgcmV0dXJuIGZuO1xuICB9O1xuXG4gIGZuLmNyZWF0ZUNsdXN0ZXJzID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBjcmVhdGVDbHVzdGVycztcbiAgICBjcmVhdGVDbHVzdGVycyA9IHZhbHVlO1xuICAgIHJldHVybiBmbjtcbiAgfTtcblxuICBmbi5jcmVhdGVFZGdlTGFiZWxzID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBjcmVhdGVFZGdlTGFiZWxzO1xuICAgIGNyZWF0ZUVkZ2VMYWJlbHMgPSB2YWx1ZTtcbiAgICByZXR1cm4gZm47XG4gIH07XG5cbiAgZm4uY3JlYXRlRWRnZVBhdGhzID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBjcmVhdGVFZGdlUGF0aHM7XG4gICAgY3JlYXRlRWRnZVBhdGhzID0gdmFsdWU7XG4gICAgcmV0dXJuIGZuO1xuICB9O1xuXG4gIGZuLnNoYXBlcyA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gc2hhcGVzO1xuICAgIHNoYXBlcyA9IHZhbHVlO1xuICAgIHJldHVybiBmbjtcbiAgfTtcblxuICBmbi5hcnJvd3MgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGFycm93cztcbiAgICBhcnJvd3MgPSB2YWx1ZTtcbiAgICByZXR1cm4gZm47XG4gIH07XG5cbiAgcmV0dXJuIGZuO1xufVxuXG52YXIgTk9ERV9ERUZBVUxUX0FUVFJTID0ge1xuICBwYWRkaW5nTGVmdDogMTAsXG4gIHBhZGRpbmdSaWdodDogMTAsXG4gIHBhZGRpbmdUb3A6IDEwLFxuICBwYWRkaW5nQm90dG9tOiAxMCxcbiAgcng6IDAsXG4gIHJ5OiAwLFxuICBzaGFwZTogXCJyZWN0XCJcbn07XG5cbnZhciBFREdFX0RFRkFVTFRfQVRUUlMgPSB7XG4gIGFycm93aGVhZDogXCJub3JtYWxcIixcbiAgbGluZUludGVycG9sYXRlOiBcImxpbmVhclwiXG59O1xuXG5mdW5jdGlvbiBwcmVQcm9jZXNzR3JhcGgoZykge1xuICBnLm5vZGVzKCkuZm9yRWFjaChmdW5jdGlvbih2KSB7XG4gICAgdmFyIG5vZGUgPSBnLm5vZGUodik7XG4gICAgaWYgKCFfLmhhcyhub2RlLCBcImxhYmVsXCIpICYmICFnLmNoaWxkcmVuKHYpLmxlbmd0aCkgeyBub2RlLmxhYmVsID0gdjsgfVxuXG4gICAgaWYgKF8uaGFzKG5vZGUsIFwicGFkZGluZ1hcIikpIHtcbiAgICAgIF8uZGVmYXVsdHMobm9kZSwge1xuICAgICAgICBwYWRkaW5nTGVmdDogbm9kZS5wYWRkaW5nWCxcbiAgICAgICAgcGFkZGluZ1JpZ2h0OiBub2RlLnBhZGRpbmdYXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoXy5oYXMobm9kZSwgXCJwYWRkaW5nWVwiKSkge1xuICAgICAgXy5kZWZhdWx0cyhub2RlLCB7XG4gICAgICAgIHBhZGRpbmdUb3A6IG5vZGUucGFkZGluZ1ksXG4gICAgICAgIHBhZGRpbmdCb3R0b206IG5vZGUucGFkZGluZ1lcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChfLmhhcyhub2RlLCBcInBhZGRpbmdcIikpIHtcbiAgICAgIF8uZGVmYXVsdHMobm9kZSwge1xuICAgICAgICBwYWRkaW5nTGVmdDogbm9kZS5wYWRkaW5nLFxuICAgICAgICBwYWRkaW5nUmlnaHQ6IG5vZGUucGFkZGluZyxcbiAgICAgICAgcGFkZGluZ1RvcDogbm9kZS5wYWRkaW5nLFxuICAgICAgICBwYWRkaW5nQm90dG9tOiBub2RlLnBhZGRpbmdcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIF8uZGVmYXVsdHMobm9kZSwgTk9ERV9ERUZBVUxUX0FUVFJTKTtcblxuICAgIF8uZWFjaChbXCJwYWRkaW5nTGVmdFwiLCBcInBhZGRpbmdSaWdodFwiLCBcInBhZGRpbmdUb3BcIiwgXCJwYWRkaW5nQm90dG9tXCJdLCBmdW5jdGlvbihrKSB7XG4gICAgICBub2RlW2tdID0gTnVtYmVyKG5vZGVba10pO1xuICAgIH0pO1xuXG4gICAgLy8gU2F2ZSBkaW1lbnNpb25zIGZvciByZXN0b3JlIGR1cmluZyBwb3N0LXByb2Nlc3NpbmdcbiAgICBpZiAoXy5oYXMobm9kZSwgXCJ3aWR0aFwiKSkgeyBub2RlLl9wcmV2V2lkdGggPSBub2RlLndpZHRoOyB9XG4gICAgaWYgKF8uaGFzKG5vZGUsIFwiaGVpZ2h0XCIpKSB7IG5vZGUuX3ByZXZIZWlnaHQgPSBub2RlLmhlaWdodDsgfVxuICB9KTtcblxuICBnLmVkZ2VzKCkuZm9yRWFjaChmdW5jdGlvbihlKSB7XG4gICAgdmFyIGVkZ2UgPSBnLmVkZ2UoZSk7XG4gICAgaWYgKCFfLmhhcyhlZGdlLCBcImxhYmVsXCIpKSB7IGVkZ2UubGFiZWwgPSBcIlwiOyB9XG4gICAgXy5kZWZhdWx0cyhlZGdlLCBFREdFX0RFRkFVTFRfQVRUUlMpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gcG9zdFByb2Nlc3NHcmFwaChnKSB7XG4gIF8uZWFjaChnLm5vZGVzKCksIGZ1bmN0aW9uKHYpIHtcbiAgICB2YXIgbm9kZSA9IGcubm9kZSh2KTtcblxuICAgIC8vIFJlc3RvcmUgb3JpZ2luYWwgZGltZW5zaW9uc1xuICAgIGlmIChfLmhhcyhub2RlLCBcIl9wcmV2V2lkdGhcIikpIHtcbiAgICAgIG5vZGUud2lkdGggPSBub2RlLl9wcmV2V2lkdGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlbGV0ZSBub2RlLndpZHRoO1xuICAgIH1cblxuICAgIGlmIChfLmhhcyhub2RlLCBcIl9wcmV2SGVpZ2h0XCIpKSB7XG4gICAgICBub2RlLmhlaWdodCA9IG5vZGUuX3ByZXZIZWlnaHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlbGV0ZSBub2RlLmhlaWdodDtcbiAgICB9XG5cbiAgICBkZWxldGUgbm9kZS5fcHJldldpZHRoO1xuICAgIGRlbGV0ZSBub2RlLl9wcmV2SGVpZ2h0O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlT3JTZWxlY3RHcm91cChyb290LCBuYW1lKSB7XG4gIHZhciBzZWxlY3Rpb24gPSByb290LnNlbGVjdChcImcuXCIgKyBuYW1lKTtcbiAgaWYgKHNlbGVjdGlvbi5lbXB0eSgpKSB7XG4gICAgc2VsZWN0aW9uID0gcm9vdC5hcHBlbmQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBuYW1lKTtcbiAgfVxuICByZXR1cm4gc2VsZWN0aW9uO1xufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBpbnRlcnNlY3RSZWN0ID0gcmVxdWlyZShcIi4vaW50ZXJzZWN0L2ludGVyc2VjdC1yZWN0XCIpLFxuICAgIGludGVyc2VjdEVsbGlwc2UgPSByZXF1aXJlKFwiLi9pbnRlcnNlY3QvaW50ZXJzZWN0LWVsbGlwc2VcIiksXG4gICAgaW50ZXJzZWN0Q2lyY2xlID0gcmVxdWlyZShcIi4vaW50ZXJzZWN0L2ludGVyc2VjdC1jaXJjbGVcIiksXG4gICAgaW50ZXJzZWN0UG9seWdvbiA9IHJlcXVpcmUoXCIuL2ludGVyc2VjdC9pbnRlcnNlY3QtcG9seWdvblwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHJlY3Q6IHJlY3QsXG4gIGVsbGlwc2U6IGVsbGlwc2UsXG4gIGNpcmNsZTogY2lyY2xlLFxuICBkaWFtb25kOiBkaWFtb25kXG59O1xuXG5mdW5jdGlvbiByZWN0KHBhcmVudCwgYmJveCwgbm9kZSwgc2NhbGUpIHtcbiAgdmFyIG11bHRpcGxpZXIgPSBzY2FsZSA/ICgxL3NjYWxlKSA6IDE7XG4gIGNvbnNvbGUubG9nKG11bHRpcGxpZXIpO1xuICBwYXJlbnQuc2VsZWN0QWxsKFwicmVjdFwiKS5yZW1vdmUoKTtcbiAgdmFyIHNoYXBlU3ZnID0gcGFyZW50Lmluc2VydChcInJlY3RcIiwgXCI6Zmlyc3QtY2hpbGRcIilcbiAgICAgICAgLmF0dHIoXCJyeFwiLCBub2RlLnJ4KVxuICAgICAgICAuYXR0cihcInJ5XCIsIG5vZGUucnkpXG4gICAgICAgIC5hdHRyKFwieFwiLCAtYmJveC53aWR0aCAvIDIpXG4gICAgICAgIC5hdHRyKFwieVwiLCAtYmJveC5oZWlnaHQgLyAyKVxuICAgICAgICAuYXR0cihcIndpZHRoXCIsIGJib3gud2lkdGgpXG4gICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGJib3guaGVpZ2h0KTtcblxuICBub2RlLmludGVyc2VjdCA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgcmV0dXJuIGludGVyc2VjdFJlY3Qobm9kZSwgcG9pbnQpO1xuICB9O1xuXG4gIHJldHVybiBzaGFwZVN2Zztcbn1cblxuZnVuY3Rpb24gZWxsaXBzZShwYXJlbnQsIGJib3gsIG5vZGUpIHtcbiAgcGFyZW50LnNlbGVjdEFsbChcImVsbGlwc2VcIikucmVtb3ZlKCk7XG4gIHZhciByeCA9IGJib3gud2lkdGggLyAyLFxuICAgICAgcnkgPSBiYm94LmhlaWdodCAvIDIsXG4gICAgICBzaGFwZVN2ZyA9IHBhcmVudC5pbnNlcnQoXCJlbGxpcHNlXCIsIFwiOmZpcnN0LWNoaWxkXCIpXG4gICAgICAgIC5hdHRyKFwieFwiLCAtYmJveC53aWR0aCAvIDIpXG4gICAgICAgIC5hdHRyKFwieVwiLCAtYmJveC5oZWlnaHQgLyAyKVxuICAgICAgICAuYXR0cihcInJ4XCIsIHJ4KVxuICAgICAgICAuYXR0cihcInJ5XCIsIHJ5KTtcblxuICBub2RlLmludGVyc2VjdCA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgcmV0dXJuIGludGVyc2VjdEVsbGlwc2Uobm9kZSwgcngsIHJ5LCBwb2ludCk7XG4gIH07XG5cbiAgcmV0dXJuIHNoYXBlU3ZnO1xufVxuXG5mdW5jdGlvbiBjaXJjbGUocGFyZW50LCBiYm94LCBub2RlKSB7XG4gIHBhcmVudC5zZWxlY3RBbGwoXCJjaXJjbGVcIikucmVtb3ZlKCk7XG4gIHZhciByID0gTWF0aC5tYXgoYmJveC53aWR0aCwgYmJveC5oZWlnaHQpIC8gMixcbiAgICAgIHNoYXBlU3ZnID0gcGFyZW50Lmluc2VydChcImNpcmNsZVwiLCBcIjpmaXJzdC1jaGlsZFwiKVxuICAgICAgICAuYXR0cihcInhcIiwgLWJib3gud2lkdGggLyAyKVxuICAgICAgICAuYXR0cihcInlcIiwgLWJib3guaGVpZ2h0IC8gMilcbiAgICAgICAgLmF0dHIoXCJyXCIsIHIpO1xuXG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICByZXR1cm4gaW50ZXJzZWN0Q2lyY2xlKG5vZGUsIHIsIHBvaW50KTtcbiAgfTtcblxuICByZXR1cm4gc2hhcGVTdmc7XG59XG5cbi8vIENpcmN1bXNjcmliZSBhbiBlbGxpcHNlIGZvciB0aGUgYm91bmRpbmcgYm94IHdpdGggYSBkaWFtb25kIHNoYXBlLiBJIGRlcml2ZWRcbi8vIHRoZSBmdW5jdGlvbiB0byBjYWxjdWxhdGUgdGhlIGRpYW1vbmQgc2hhcGUgZnJvbTpcbi8vIGh0dHA6Ly9tYXRoZm9ydW0ub3JnL2tiL21lc3NhZ2UuanNwYT9tZXNzYWdlSUQ9Mzc1MDIzNlxuZnVuY3Rpb24gZGlhbW9uZChwYXJlbnQsIGJib3gsIG5vZGUpIHtcbiAgcGFyZW50LnNlbGVjdEFsbChcInBvbHlnb25cIikucmVtb3ZlKCk7XG4gIHZhciB3ID0gKGJib3gud2lkdGggKiBNYXRoLlNRUlQyKSAvIDIsXG4gICAgICBoID0gKGJib3guaGVpZ2h0ICogTWF0aC5TUVJUMikgLyAyLFxuICAgICAgcG9pbnRzID0gW1xuICAgICAgICB7IHg6ICAwLCB5OiAtaCB9LFxuICAgICAgICB7IHg6IC13LCB5OiAgMCB9LFxuICAgICAgICB7IHg6ICAwLCB5OiAgaCB9LFxuICAgICAgICB7IHg6ICB3LCB5OiAgMCB9XG4gICAgICBdLFxuICAgICAgc2hhcGVTdmcgPSBwYXJlbnQuaW5zZXJ0KFwicG9seWdvblwiLCBcIjpmaXJzdC1jaGlsZFwiKVxuICAgICAgICAuYXR0cihcInBvaW50c1wiLCBwb2ludHMubWFwKGZ1bmN0aW9uKHApIHsgcmV0dXJuIHAueCArIFwiLFwiICsgcC55OyB9KS5qb2luKFwiIFwiKSk7XG5cbiAgbm9kZS5pbnRlcnNlY3QgPSBmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuIGludGVyc2VjdFBvbHlnb24obm9kZSwgcG9pbnRzLCBwKTtcbiAgfTtcblxuICByZXR1cm4gc2hhcGVTdmc7XG59XG4iLCJ2YXIgXyA9IHJlcXVpcmUoXCIuL2xvZGFzaFwiKTtcblxuLy8gUHVibGljIHV0aWxpdHkgZnVuY3Rpb25zXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNTdWJncmFwaDogaXNTdWJncmFwaCxcbiAgZWRnZVRvSWQ6IGVkZ2VUb0lkLFxuICBhcHBseVN0eWxlOiBhcHBseVN0eWxlLFxuICBhcHBseUNsYXNzOiBhcHBseUNsYXNzLFxuICBhcHBseVRyYW5zaXRpb246IGFwcGx5VHJhbnNpdGlvblxufTtcblxuLypcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIG5vZGUgaW4gdGhlIGdyYXBoIGlzIGEgc3ViZ3JhcGggbm9kZS4gQVxuICogc3ViZ3JhcGggbm9kZSBpcyBvbmUgdGhhdCBjb250YWlucyBvdGhlciBub2Rlcy5cbiAqL1xuZnVuY3Rpb24gaXNTdWJncmFwaChnLCB2KSB7XG4gIHJldHVybiAhIWcuY2hpbGRyZW4odikubGVuZ3RoO1xufVxuXG5mdW5jdGlvbiBlZGdlVG9JZChlKSB7XG4gIHJldHVybiBlc2NhcGVJZChlLnYpICsgXCI6XCIgKyBlc2NhcGVJZChlLncpICsgXCI6XCIgKyBlc2NhcGVJZChlLm5hbWUpO1xufVxuXG52YXIgSURfREVMSU0gPSAvOi9nO1xuZnVuY3Rpb24gZXNjYXBlSWQoc3RyKSB7XG4gIHJldHVybiBzdHIgPyBTdHJpbmcoc3RyKS5yZXBsYWNlKElEX0RFTElNLCBcIlxcXFw6XCIpIDogXCJcIjtcbn1cblxuZnVuY3Rpb24gYXBwbHlTdHlsZShkb20sIHN0eWxlRm4pIHtcbiAgaWYgKHN0eWxlRm4pIHtcbiAgICBkb20uYXR0cihcInN0eWxlXCIsIHN0eWxlRm4pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFwcGx5Q2xhc3MoZG9tLCBjbGFzc0ZuLCBvdGhlckNsYXNzZXMpIHtcbiAgaWYgKGNsYXNzRm4pIHtcbiAgICBkb21cbiAgICAgIC5hdHRyKFwiY2xhc3NcIiwgY2xhc3NGbilcbiAgICAgIC5hdHRyKFwiY2xhc3NcIiwgb3RoZXJDbGFzc2VzICsgXCIgXCIgKyBkb20uYXR0cihcImNsYXNzXCIpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhcHBseVRyYW5zaXRpb24oc2VsZWN0aW9uLCBnKSB7XG4gIHZhciBncmFwaCA9IGcuZ3JhcGgoKTtcblxuICBpZiAoXy5pc1BsYWluT2JqZWN0KGdyYXBoKSkge1xuICAgIHZhciB0cmFuc2l0aW9uID0gZ3JhcGgudHJhbnNpdGlvbjtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKHRyYW5zaXRpb24pKSB7XG4gICAgICByZXR1cm4gdHJhbnNpdGlvbihzZWxlY3Rpb24pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzZWxlY3Rpb247XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IFwiMC40LjE4LXByZVwiO1xuIl19

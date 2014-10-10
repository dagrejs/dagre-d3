var intersectCircle = require("./intersect-circle"),
    intersectEllipse = require("./intersect-ellipse"),
    intersectPolygon = require("./intersect-polygon"),
    intersectRect = require("./intersect-rect");

module.exports = intersectNode;

function isEllipse(obj) {
  return Object.prototype.toString.call(obj) === "[object SVGEllipseElement]";
}

function isCircle(obj) {
  return Object.prototype.toString.call(obj) === "[object SVGCircleElement]";
}

function isPolygon(obj) {
  return Object.prototype.toString.call(obj) === "[object SVGPolygonElement]";
}

function intersectNode(node, point, def) {
  return node.intersect(point);
}


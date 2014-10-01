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
  if (def) {
    if (isCircle(def)) {
      return intersectCircle(node, def.r.baseVal.value, point);
    } else if (isEllipse(def)) {
      return intersectEllipse(node,
                              def.rx.baseVal.value, def.ry.baseVal.value,
                              point);
    } else if (isPolygon(def)) {
      return intersectPolygon(node, def, point);
    }
  }
  return intersectRect(node, point);
}


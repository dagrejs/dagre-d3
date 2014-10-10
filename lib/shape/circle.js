var intersectCircle = require("../intersect/intersect-circle");

module.exports = circle;

function circle(parent, bbox, node) {
  var r = Math.max(bbox.width, bbox.height),
      shapeSvg = parent.insert("circle", ":first-child")
        .attr("x", -bbox.width / 2)
        .attr("y", -bbox.height / 2)
        .attr("r", r)
        .style("fill", node.fill || "#fff")
        .style("stroke", node.stroke || "#000");

  node.intersect = function(point) {
    return intersectCircle(node, r, point);
  };

  return shapeSvg;
}

var intersectRect = require("../intersect/intersect-rect");

module.exports = rect;

function rect(parent, bbox, node) {
  var shapeSvg = parent.insert("rect", ":first-child")
        .attr("rx", node.rx || 0)
        .attr("ry", node.ry || 0)
        .attr("x", -bbox.width / 2)
        .attr("y", -bbox.height / 2)
        .attr("width", bbox.width)
        .attr("height", bbox.height)
        .style("fill", node.fill || "#fff")
        .style("stroke", node.stroke || "#000");

  node.intersect = function(point) {
    return intersectRect(node, point);
  };

  return shapeSvg;
}

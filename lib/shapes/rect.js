var intersectRect = require("../intersect/intersect-rect");

module.exports = rect;

function rect(parent, bbox, node) {
  var shapeSvg = parent.insert("rect", ":first-child")
        .attr("rx", node.rx)
        .attr("ry", node.ry)
        .attr("x", -bbox.width / 2)
        .attr("y", -bbox.height / 2)
        .attr("width", bbox.width)
        .attr("height", bbox.height)
        .style("fill", node.fill)
        .style("stroke", node.stroke);

  node.intersect = function(point) {
    return intersectRect(node, point);
  };

  return shapeSvg;
}

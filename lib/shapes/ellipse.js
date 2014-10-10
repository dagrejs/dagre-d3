var intersectEllipse = require("../intersect/intersect-ellipse");

module.exports = ellipse;

function ellipse(parent, bbox, node) {
  var rx = bbox.width / 2,
      ry = bbox.height / 2,
      shapeSvg = parent.insert("ellipse", ":first-child")
        .attr("x", -bbox.width / 2)
        .attr("y", -bbox.height / 2)
        .attr("rx", rx)
        .attr("ry", ry)
        .style("fill", node.fill)
        .style("stroke", node.stroke);

  node.intersect = function(point) {
    return intersectEllipse(node, rx, ry, point);
  };

  return shapeSvg;
}

var intersectNode = require("./intersect/intersect-node");

module.exports = positionEdgePaths;

function positionEdgePaths(selection, g) {
  function calcPoints(e) {
    var edge = g.edge(e),
        tail = g.node(e.v),
        head = g.node(e.w),
        points = edge.points.slice(1, edge.points.length - 1);
    points.unshift(intersectNode(tail, points[0]));
    points.push(intersectNode(head, points[points.length - 1]));
    return d3.svg.line()
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; })
      (points);
  }

  selection.attr("d", calcPoints);
}

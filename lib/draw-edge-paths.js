var intersectNode = require("./intersect/intersect-node"),
    util = require("./util");

module.exports = drawEdgePaths;

function drawEdgePaths() {
  var line = d3.svg.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .interpolate("basis");

  var fn = function(selection, g) {
    var svgPaths = selection.selectAll("path.edgePath")
      .data(g.edges(), function(e) { return util.edgeToId(e); })
      .classed("update", true);

    svgPaths.enter().append("path").attr("class", "edgePath");
    svgPaths.exit().remove();

    function calcPoints(e) {
      var edge = g.edge(e),
          tail = g.node(e.v),
          head = g.node(e.w),
          points = edge.points.slice(1, edge.points.length - 1);
      points.unshift(intersectNode(tail, points[0]));
      points.push(intersectNode(head, points[points.length - 1]));
      return line(points);
    }

    svgPaths
      .attr("d", calcPoints)
      .attr("marker-end", function(e) {
        var arrowhead = g.edge(e).arrowhead;
        if (!arrowhead && g.isDirected()) {
          arrowhead = "arrow-normal";
        }
        if (arrowhead) {
          return "url(#" + arrowhead + ")";
        }
      });

    return svgPaths;
  };

  fn.line = function(value) {
    if (!arguments.length) return line;
    line = value;
    return fn;
  };

  return fn;
}

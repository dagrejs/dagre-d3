var _ = require("lodash"),
    intersectNode = require("./intersect/intersect-node"),
    util = require("./util");

module.exports = createEdgePaths;

function createEdgePaths(selection, g, arrows) {
  var svgPaths = selection.selectAll("g.edgePath")
    .data(g.edges(), function(e) { return util.edgeToId(e); })
    .classed("update", true);

  var svgPathsEnter = svgPaths.enter()
    .append("g")
    .attr("class", "edgePath");
  svgPathsEnter.append("path").attr("class", "path");
  svgPathsEnter.append("defs");
  svgPaths.exit().remove();

  function calcPoints(e) {
    var edge = g.edge(e),
        tail = g.node(e.v),
        head = g.node(e.w),
        points = edge.points.slice(1, edge.points.length - 1);
    points.unshift(intersectNode(tail, points[0]));
    points.push(intersectNode(head, points[points.length - 1]));

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

  svgPaths.selectAll("path.path")
    .each(function(e) {
      var edge = g.edge(e);
      edge.arrowheadId = _.uniqueId("arrowhead");

      var domEdge = d3.select(this)
        .attr("d", calcPoints)
        .attr("marker-end", function() {
          return "url(#" + edge.arrowheadId + ")";
        })
        .style("fill", "none");
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

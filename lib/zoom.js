var d3 = require("./d3");

module.exports = zoom;

/*
 * A helper to attach a zoom overlay as the first child to the given SVG
 * element. The zoomFn property defines the zoom behavior and can either be a
 * custom D3 zoom object or one of the defaults available on this function.
 * Returns the zoom overlay object.
 */
function zoom(svg, zoomFn) {
  var overlay = svg.insert("rect", ":first-child")
      .attr("class", "dagre-d3-zoom-overlay")
      .attr("width", "100%")
      .attr("height", "100%")
      .style("fill", "none")
      .style("pointer-events", "all");

  svg.call(zoomFn);

  return overlay;
}

zoom.panAndZoom = function(target) {
  return d3.behavior.zoom().on("zoom", function() {
    target.attr("transform", "translate(" + d3.event.translate + ")" +
                             "scale(" + d3.event.scale + ")");
  });
};

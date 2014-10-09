module.exports = createZoomPanel;

function createZoomPanel() {
  var zoom,
      prevZoom,
      zoomChanged = false;

  var fn = function(selection, zoomableSelection) {
    var zoomPanel;
    if (zoomChanged) {
      if (prevZoom) {
        // Clear out previous zoom
        prevZoom.on("zoom");
      }

      if (zoom) {
        zoomPanel = selection.select("rect.zoomPanel");
        if (zoomPanel.empty()) {
          zoomPanel = selection.append("rect")
            .attr("class", "zoomPanel")
            .attr("width", "100%")
            .attr("height", "100%")
            .style("fill", "none")
            .style("pointer-events", "all");
        }
        zoomPanel.call(zoom(zoomableSelection));
      }

      zoomChanged = false;
      prevZoom = zoom;
    }
  };

  fn.zoom = function(value) {
    if (!arguments.length) return zoom;
    zoomChanged = true;
    zoom = value;
    return fn;
  };

  return fn;
}

module.exports = createZoomPanel;

function createZoomPanel() {
  var zoomFn,
      zoom,
      prevZoom,
      zoomChanged = false;

  var fn = function(selection, zoomableSelection) {
    var zoomPanel;
    if (zoomChanged) {
      if (prevZoom) {
        // Clear out previous zoom
        prevZoom.on("zoom");
      }

      if (zoomFn) {
        zoomPanel = selection.select("rect.zoomPanel");
        if (zoomPanel.empty()) {
          zoomPanel = selection.append("rect")
            .attr("class", "zoomPanel")
            .attr("width", "100%")
            .attr("height", "100%")
            .style("fill", "none")
            .style("pointer-events", "all");
        }
        zoom = zoomFn(zoomableSelection);
        zoomPanel.call(zoom);
      }

      zoomChanged = false;
      prevZoom = zoom;
    }

    return zoom;
  };

  fn.zoom = function(value) {
    if (!arguments.length) return zoomFn;
    zoomChanged = true;
    zoomFn = value;
    return fn;
  };

  return fn;
}

var util = require("./util");

module.exports = {
  "default": normal,
  "normal": normal,
  "vee": vee
};

function normal(parent, id, edge) {
  var marker = parent.append("marker")
    .attr("id", id)
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 9)
    .attr("refY", 5)
    .attr("markerUnits", "strokeWidth")
    .attr("markerWidth", 10)
    .attr("markerHeight", 8)
    .attr("orient", "auto");

  var path = marker.append("path").attr("d", "M 0 0 L 10 5 L 0 10 z");
  util.applyStyles(path, edge, "style");
}

function vee(parent, id, edge) {
  var marker = parent.append("marker")
    .attr("id", id)
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 9)
    .attr("refY", 5)
    .attr("markerUnits", "strokeWidth")
    .attr("markerWidth", 10)
    .attr("markerHeight", 8)
    .attr("orient", "auto");

  var path = marker.append("path").attr("d", "M 0 0 L 10 5 L 0 10 L 4 5 z");
  util.applyStyles(path, edge, "style");
}

module.exports = normal;

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

  marker.append("path")
    .attr("d", "M 0 0 L 10 5 L 0 10 L 4 5 z")
    .style("stroke", edge.stroke || "#000")
    .style("fill", edge.stroke || "#000");
}

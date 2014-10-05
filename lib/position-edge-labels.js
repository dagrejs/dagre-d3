module.exports = positionEdgeLabels;

function positionEdgeLabels(selection, g) {
  selection.attr("transform", function(e) {
    var edge = g.edge(e);
    if (edge.width && edge.height) {
      return "translate(" + edge.x + "," + edge.y + ")";
    }
  });
}

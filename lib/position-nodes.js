module.exports = positionNodes;

function positionNodes(selection, g) {
  selection.attr("transform", function(v) {
    var node = g.node(v);
    return "translate(" + node.x + "," + node.y + ")";
  });
}

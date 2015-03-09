var util = require("../util");

module.exports = addArrayLabel;

/*
 * Attaches a text label to the specified root. Handles escape sequences.
 */
function addArrayLabel(root, node) {
  var domNode = root.append("text");
  var tspanNode = [];

  for (var i = 0; i < node.label.length; i++) {
    tspanNode.push(domNode.append("tspan"));
    tspanNode[i]
        .attr("dy", i === 0 ? "1em" : "2em")
        .attr("x", "1")
        .attr("text-anchor", "middle")
        .text(node.label[i]);
  }

  // Center the text
  var textBounds = domNode.node().getBBox();
  for (i = 0; i < tspanNode.length; i++) {
    tspanNode[i].attr("x", -textBounds.x);
  }

  util.applyStyle(domNode, node.labelStyle);

  return domNode;
}

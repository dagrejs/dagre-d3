 var addTextLabel = require("./add-text-label"),
    addArrayLabel = require("./add-array-label"),
    addHtmlLabel = require("./add-html-label");

module.exports = addLabel;

function addLabel(root, node, cluster) {
  var label = node.label;
  var labelSvg = root.append("g");

  // Allow the label to be a string, a function that returns a DOM element, or
  // a DOM element itself.
  if (node.labelType === "html") {
    addHtmlLabel(labelSvg, node);
  } else if (typeof label === "string" || typeof label === "number") {
    addTextLabel(labelSvg, node);
  } else if (typeof label === "object" && Array.isArray(label)) {
    addArrayLabel(labelSvg, node);
  } else {
    console.log("Invalid label type");
  }

  if (!cluster) {
    var labelBBox = labelSvg.node().getBBox();
    let offsetX = node.shape === 'stack' ? -2 : 0;
    let offsetY = node.shape === 'stack' ? -4 : 0;
    labelSvg.attr("transform",
        "translate(" + (-labelBBox.width / 2 + offsetX) + "," + (-labelBBox.height / 2 + offsetY) + ")");
  } else {
    labelSvg.attr("transform", "translate(" + (node.x - node.width / 2) + "," +
        (node.y - node.height / 2 - 20) + ")");
  }

  return labelSvg;
}

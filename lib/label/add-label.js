var addTextLabel = require("./add-text-label");
var addHtmlLabel = require("./add-html-label");
var addSVGLabel  = require("./add-svg-label");

module.exports = addLabel;

function addLabel(root, node, location) {
  var label = node.label;
  var labelSvg = root.append("g");

  // Allow the label to be a string, a function that returns a DOM element, or
  // a DOM element itself.
  if (node.labelType === "svg") {
    addSVGLabel(labelSvg, node);
  } else if (typeof label !== "string" || node.labelType === "html") {
    addHtmlLabel(labelSvg, node);
  } else {
    addTextLabel(labelSvg, node);
  }

  var labelBBox = labelSvg.node().getBBox();
  var x = (-labelBBox.width / 2);
  var y = (-labelBBox.height / 2);
  switch(node.labelLocation || location) {
  case "top":
    y = (-node.height / 2);
    break;
  case "bottom":
    y = (node.height / 2) - labelBBox.height;
    break;
  case "origin":
    x = 0;
    y = 0;
    break;
  }
  labelSvg.attr(
    "transform",
    "translate(" + x + "," + y + ")");

  return labelSvg;
}

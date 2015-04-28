var addTextLabel = require("./add-text-label"),
    addHtmlLabel = require("./add-html-label");

module.exports = addLabel;

function addLabel(root, node, location) {
  var label = node.label;
  var labelSvg = root.append("g");
  var domNode = null;

  // Allow the label to be a string, a function that returns a DOM element, or
  // a DOM element itself.
  if (typeof label !== "string" || node.labelType === "html") {
    domNode = addHtmlLabel(labelSvg, node);
  } else {
    domNode = addTextLabel(labelSvg, node);
  }
  
  //rotate text 
  if (node.rotate !== undefined) {
    var w = domNode.node().getBBox().width;
    domNode.attr("transform", "translate(" + 0 + ", " + w + ") rotate(" + node.rotate.toString() + ")");
  }
                
  var labelBBox = labelSvg.node().getBBox();
  switch(location) {
    case "top":
      y = (-node.height / 2);
      break;
    case "bottom":
      y = (node.height / 2) - labelBBox.height;
      break;
    default:
      y = (-labelBBox.height / 2);
  }
  labelSvg.attr("transform",
                "translate(" + (-labelBBox.width / 2) + "," + y + ")");

  return labelSvg;
}

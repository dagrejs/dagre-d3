var addTextLabel = require("./add-text-label"),
    addHtmlLabel = require("./add-html-label"),
    addSVGLabel  = require("./add-svg-label");


function createLabel(root, node, location) {
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

  return {labelSvg: labelSvg, node: node, location: location};

}

function getLabelBBox(item) {
  item.labelBBox = item.labelSvg.node().getBBox();
}

function finishStyling(item) {
  var node = item.node;
  var labelSvg = item.labelSvg;
  var labelBBox = item.labelBBox;
  var location = item.location;

  var y;
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

function styleLabels(items) {
  items.forEach(getLabelBBox);

  return items.map(finishStyling);
}


module.exports.createLabel = createLabel;
module.exports.getLabelBBox = getLabelBBox;
module.exports.finishStyling = finishStyling;
module.exports.styleLabels = styleLabels;

var addTextLabel = require("./add-text-label"),
    addHtmlLabel = require("./add-html-label"),
    addSVGLabel  = require("./add-svg-label");

module.exports = addLabel;

function addLabel(root, node, location) {
  var labelSvg = root.append("g");

  switch (node.labelType) {
    case "svg": addSVGLabel(labelSvg, node); break;
    case "html": addHtmlLabel(labelSvg, node); break;
    default: addTextLabel(labelSvg, node); break;
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

  if (node.labelType === "text") {
    switch(node.labelJust) {
      case "right":
          x = (labelBBox.width / 2);
          break;
      case "left":
          x = (-labelBBox.width / 2);
          break;
      default:
          x = 0;
          break;
    }
  } else {
    x = -labelBBox.width / 2;
  }

  labelSvg.attr("transform", "translate(" + x + "," + y + ")");

  return labelSvg;
}

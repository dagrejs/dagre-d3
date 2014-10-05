var addTextLabel = require("./add-text-label"),
    addHtmlLabel = require("./add-html-label");

module.exports = addLabel;

function addLabel(root, node, marginX, marginY) {
  // If the node has "useDef" meta data, we rely on that
  if (node.useDef) {
    root.append("use").attr("xlink:href", "#" + node.useDef);
    return;
  }
  // Add the rect first so that it appears behind the label
  var label = node.label;
  var rect = root.append("rect");
  if (node.width) {
    rect.attr("width", node.width);
  }
  if (node.height) {
    rect.attr("height", node.height);
  }

  var labelSvg = root.append("g");

  // Allow the label to be a string, a function that returns a DOM element, or
  // a DOM element itself.
  if (typeof label !== "string" || node.labelType === "html") {
    marginX = marginY = 0;
    addHtmlLabel(label, labelSvg, node.labelStyle);
  } else {
    addTextLabel(label, labelSvg, node.labelStyle);
  }

  var labelBBox = labelSvg.node().getBBox();
  labelSvg.attr("transform",
                "translate(" + (-labelBBox.width / 2) + "," + (-labelBBox.height / 2) + ")");

  var bbox = root.node().getBBox();

  rect
    .attr("rx", node.rx ? node.rx : 5)
    .attr("ry", node.ry ? node.ry : 5)
    .attr("x", -(bbox.width / 2 + marginX))
    .attr("y", -(bbox.height / 2 + marginY))
    .attr("width", bbox.width + 2 * marginX)
    .attr("height", bbox.height + 2 * marginY)
    .attr("fill", "#fff");

  return rect;
}


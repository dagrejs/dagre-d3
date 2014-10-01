var util = require("../util");

module.exports = addHtmlLabel;

function addHtmlLabel(label, root, style) {
  var fo = root
    .append("foreignObject")
      .attr("width", "100000");

  var div = fo
    .append("xhtml:div")
      .style("float", "left");

  switch(typeof label) {
    case "function":
      div.insert(label);
      break;
    case "object":
      // Currently we assume this is a DOM object.
      div.insert(function() { return label; });
      break;
    default: div.html(label);
  }

  util.applyStyle(div, style);

  // TODO find a better way to get dimensions for foreignObjects...
  var w, h;
  div
    .each(function() {
      w = this.clientWidth;
      h = this.clientHeight;
    });

  fo
    .attr("width", w)
    .attr("height", h);

  return fo;
}

module.exports = addHtmlLabel;

function addHtmlLabel(label, root) {
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
      div.insert(label);
      break;
    default: div.html(label);
  }

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
}

// Public utility functions
module.exports = {
  wordwrap: wordwrap,
  isSubgraph: isSubgraph,
  applyStyle: applyStyle,
  edgeToId: edgeToId,
  panAndZoom: panAndZoom,
  panOnly: panOnly,
  appendArrowTypes: appendArrowTypes
};

/*
 * Returns a function that takes a string, splits it as specified by width
 * and cut, and joins it with the brk parameter. Width is the limit to the
 * number of characters per line. If cut is true then this width is a hard
 * constraint - a word may be split in the middle to prevent a line from
 * exceeding the width. If cut is false the line will be split at the next word
 * boundary after the width has been matched or exceeded.
 *
 * Implementation from:
 * http://james.padolsey.com/javascript/wordwrap-for-javascript/
 */
function wordwrap(width, cut, brk) {
  brk = brk || "\n";
  width = width || 75;
  cut = cut || false;

  var regexStr = ".{1," + width + "}(\\s|$)" +
    (cut ? "|.{" + width + "}|.+$" : "|\\S+?(\\s|$)");
  var regex = new RegExp(regexStr, g);

  return function(str) {
    str.match(regex).join(brk);
  };
}

/*
 * Returns true if the specified node in the graph is a subgraph node. A
 * subgraph node is one that contains other nodes.
 */
function isSubgraph(g, v) {
  return !!g.children(v).length;
}

/*
 * If style is defined this function append the style string to the end of the
 * domNode.
 */
function applyStyle(domNode, style) {
  domNode.attr("style", style);
}

function edgeToId(e) {
  return escapeId(e.v) + ":" + escapeId(e.w) + ":" + escapeId(e.name);
}

var ID_DELIM = /:/g;
function escapeId(str) {
  return str ? str.replace(ID_DELIM, "\\:") : "";
}

function panAndZoom(selection) {
  return d3.behavior.zoom().on("zoom", function() {
    selection.attr("transform", "translate(" + d3.event.translate + ")" +
                                "scale(" + d3.event.scale + ")");
  });
}

function panOnly(selection) {
  return d3.behavior.zoom()
    .scaleExtent([1, 1])
    .on("zoom", function() {
      selection.attr("transform", "translate(" + d3.event.translate + ")" +
                                  "scale(" + d3.event.scale + ")");
    });
}

function appendArrowTypes(selection) {
  appendNormalArrow(selection);
}

function appendNormalArrow(selection) {
   var marker = selection.append("svg:marker")
     .attr("fill", "currentColor")
     .attr("id", "arrow-normal")
     .attr("viewBox", "0 0 10 10")
     .attr("refX", 8)
     .attr("refY", 5)
     .attr("markerUnits", "strokeWidth")
     .attr("markerWidth", 8)
     .attr("markerHeight", 5)
     .attr("orient", "auto");

   marker.append("svg:path")
     .attr("d", "M 0 0 L 10 5 L 0 10 z");
}

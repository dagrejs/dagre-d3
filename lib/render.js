var layout = require("dagre").layout;

module.exports = render;

// This design is based on http://bost.ocks.org/mike/chart/.
function render() {
  var drawNodes = require("./draw-nodes"),
      drawEdgeLabels = require("./draw-edge-labels"),
      drawEdgePaths = require("./draw-edge-paths"),
      positionNodes = require("./position-nodes"),
      positionEdgeLabels = require("./position-edge-labels");
      positionEdgePaths = require("./position-edge-paths");

  var fn = function() {
    var svg = this,
        g = svg.datum();

    preProcessGraph(g);

    var nodes = drawNodes(createOrSelect(svg, "nodes"), g),
        edgeLabels = drawEdgeLabels(createOrSelect(svg, "edgeLabels"), g),
        edgePaths = drawEdgePaths(createOrSelect(svg, "edgePaths"), g);

    nodes.each(function(v) { updateDimensions(this, g.node(v)); });
    edgeLabels.each(function(e) { updateDimensions(this, g.edge(e)); });

    layout(g);

    positionNodes(nodes, g);
    positionEdgeLabels(edgeLabels, g);
    positionEdgePaths(edgePaths, g);
  };

  fn.drawNodes = function(value) {
    if (!arguments.length) return drawNodes;
    drawNodes = value;
    return fn;
  };

  fn.positionNodes = function(value) {
    if (!arguments.length) return positionNodes;
    positionNodes = value;
    return fn;
  };

  return fn;
}

function preProcessGraph(g) {
  g.nodes().forEach(function(v) {
    var node = g.node(v);
    if (!node.hasOwnProperty("label")) {
      node.label = v;
    }
  });

  g.edges().forEach(function(e) {
    var edge = g.edge(e);
    if (!edge.hasOwnProperty("label")) {
      edge.label = "";
    }
  });
}

function updateDimensions(selection, node) {
  var bbox = selection.getBBox();
  node.width = bbox.width;
  node.height = bbox.height;
}

function createOrSelect(root, name) {
  var selection = root.select("g." + name);
  if (selection.empty()) {
    selection = root.append("g").attr("class", name);
  }
  return selection;
}

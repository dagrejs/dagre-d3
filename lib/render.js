var layout = require("dagre").layout;

module.exports = render;

// This design is based on http://bost.ocks.org/mike/chart/.
function render() {
  var createNodes = require("./create-nodes"),
      createClusters = require("./create-clusters"),
      createEdgeLabels = require("./create-edge-labels"),
      createEdgePaths = require("./create-edge-paths")(),
      positionNodes = require("./position-nodes"),
      positionEdgeLabels = require("./position-edge-labels");

  var fn = function(svg, g) {
    preProcessGraph(g);

    var clustersGroup = createOrSelect(svg, "clusters"),
        edgePathsGroup = createOrSelect(svg, "edgePaths"),
        edgeLabels = createEdgeLabels(createOrSelect(svg, "edgeLabels"), g),
        nodes = createNodes(createOrSelect(svg, "nodes"), g);

    nodes.each(function(v) { updateDimensions(this, g.node(v)); });
    edgeLabels.each(function(e) { updateDimensions(this, g.edge(e)); });

    layout(g);

    positionNodes(nodes, g);
    positionEdgeLabels(edgeLabels, g);
    createEdgePaths(edgePathsGroup, g);
    createClusters(clustersGroup, g);
  };

  fn.createNodes = function(value) {
    if (!arguments.length) return createNodes;
    createNodes = value;
    return fn;
  };

  fn.createClusters = function(value) {
    if (!arguments.length) return createClusters;
    createClusters = value;
    return fn;
  };

  fn.createEdgeLabels = function(value) {
    if (!arguments.length) return createEdgeLabels;
    createEdgeLabels = value;
    return fn;
  };

  fn.createEdgePaths = function(value) {
    if (!arguments.length) return createEdgePaths;
    createEdgePaths = value;
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

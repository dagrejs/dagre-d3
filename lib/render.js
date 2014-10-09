var layout = require("dagre").layout;

module.exports = render;

// This design is based on http://bost.ocks.org/mike/chart/.
function render() {
  var createNodes = require("./create-nodes"),
      createClusters = require("./create-clusters"),
      createEdgeLabels = require("./create-edge-labels"),
      createEdgePaths = require("./create-edge-paths")(),
      createZoomPanel = require("./create-zoom-panel")(),
      positionNodes = require("./position-nodes"),
      positionEdgeLabels = require("./position-edge-labels");

  var fn = function(svg, g) {
    preProcessGraph(g);

    var outputGroup = createOrSelectGroup(svg, "output"),
        clustersGroup = createOrSelectGroup(outputGroup, "clusters"),
        edgePathsGroup = createOrSelectGroup(outputGroup, "edgePaths"),
        edgeLabels = createEdgeLabels(createOrSelectGroup(outputGroup, "edgeLabels"), g),
        nodes = createNodes(createOrSelectGroup(outputGroup, "nodes"), g);

    createZoomPanel(svg, outputGroup);

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

  fn.createZoomPanel = function(value) {
    if (!arguments.length) return createZoomPanel;
    createZoomPanel = value;
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

function createOrSelectGroup(root, name) {
  var selection = root.select("g." + name);
  if (selection.empty()) {
    selection = root.append("g").attr("class", name);
  }
  return selection;
}

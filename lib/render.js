var _ = require("./lodash"),
    layout = require("./dagre").layout;

module.exports = render;

// This design is based on http://bost.ocks.org/mike/chart/.
function render() {
  var createNodes = require("./create-nodes"),
      createClusters = require("./create-clusters"),
      createEdgeLabels = require("./create-edge-labels"),
      createEdgePaths = require("./create-edge-paths"),
      positionNodes = require("./position-nodes"),
      positionEdgeLabels = require("./position-edge-labels"),
      positionClusters = require("./position-clusters"),
      shapes = require("./shapes"),
      arrows = require("./arrows");

  var fn = function(svg, g) {
    preProcessGraph(g);

    var outputGroup = createOrSelectGroup(svg, "output"),
        clustersGroup = createOrSelectGroup(outputGroup, "clusters"),
        edgePathsGroup = createOrSelectGroup(outputGroup, "edgePaths"),
        edgeLabels = createEdgeLabels(createOrSelectGroup(outputGroup, "edgeLabels"), g),
        nodes = createNodes(createOrSelectGroup(outputGroup, "nodes"), g, shapes);

    layout(g);

    positionNodes(nodes, g);
    positionEdgeLabels(edgeLabels, g);
    createEdgePaths(edgePathsGroup, g, arrows);

    var clusters = createClusters(clustersGroup, g);
    positionClusters(clusters, g);

    postProcessGraph(g);
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

  fn.shapes = function(value) {
    if (!arguments.length) return shapes;
    shapes = value;
    return fn;
  };

  fn.arrows = function(value) {
    if (!arguments.length) return arrows;
    arrows = value;
    return fn;
  };

  return fn;
}

var NODE_DEFAULT_ATTRS = {
  paddingLeft: 10,
  paddingRight: 10,
  paddingTop: 10,
  paddingBottom: 10,
  labelJust: "center",
  rx: 0,
  ry: 0,
  shape: "rect"
};

var EDGE_DEFAULT_ATTRS = {
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  paddingBottom: 0,
  arrowhead: "normal",
  labelJust: "left",
  lineInterpolate: "linear"
};

function preProcessGraph(g) {
  g.nodes().forEach(function(v) {
    var node = g.node(v);
    if (!_.has(node, "label") && !g.children(v).length) { node.label = v; }

    applyPadding(node);
    _.defaults(node, NODE_DEFAULT_ATTRS);
    canonicalizeLabelType(node);
    canonicalizeJustification(node);

    _.each(["paddingLeft", "paddingRight", "paddingTop", "paddingBottom"], function(k) {
      node[k] = Number(node[k]);
    });

    // Save dimensions for restore during post-processing
    if (_.has(node, "width")) { node._prevWidth = node.width; }
    if (_.has(node, "height")) { node._prevHeight = node.height; }
  });

  g.edges().forEach(function(e) {
    var edge = g.edge(e);
    if (!_.has(edge, "label")) { edge.label = ""; }

    applyPadding(edge);
    _.defaults(edge, EDGE_DEFAULT_ATTRS);
    canonicalizeLabelType(edge);
    canonicalizeJustification(edge);
  });
}

function postProcessGraph(g) {
  _.each(g.nodes(), function(v) {
    var node = g.node(v);

    // Restore original dimensions
    if (_.has(node, "_prevWidth")) {
      node.width = node._prevWidth;
    } else {
      delete node.width;
    }

    if (_.has(node, "_prevHeight")) {
      node.height = node._prevHeight;
    } else {
      delete node.height;
    }

    delete node._prevWidth;
    delete node._prevHeight;
  });
}

function createOrSelectGroup(root, name) {
  var selection = root.select("g." + name);
  if (selection.empty()) {
    selection = root.append("g").attr("class", name);
  }
  return selection;
}

function canonicalizeJustification(obj) {
    switch(obj.labelJust.toLowerCase()) {
        case "r":
        case "right":
            obj.labelJust = "right";
            break;
        case "l":
        case "left":
            obj.labelJust = "left";
            break;
        default:
            obj.labelJust = "center";
    }
}

function canonicalizeLabelType(obj) {
  if ("labelType" in obj) {
    var labelType = obj.labelType.toLowerCase();
    if (labelType === "svg" || labelType === "html") {
      return (obj.labelType = labelType);
    }
  }

  if (typeof obj.label !== "string") {
    // Assume label is either a function that returns a DOM element, or is a DOM
    // element.
    return (obj.labelType = "html");
  }

  return (obj.labelType = "text");
}

function applyPadding(obj) {
    if (_.has(obj, "paddingX")) {
      _.defaults(obj, {
        paddingLeft: obj.paddingX,
        paddingRight: obj.paddingX
      });
    }

    if (_.has(obj, "paddingY")) {
      _.defaults(obj, {
        paddingTop: obj.paddingY,
        paddingBottom: obj.paddingY
      });
    }

    if (_.has(obj, "padding")) {
      _.defaults(obj, {
        paddingLeft: obj.padding,
        paddingRight: obj.padding,
        paddingTop: obj.padding,
        paddingBottom: obj.padding
      });
    }

}

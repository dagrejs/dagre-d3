var layout = require("dagre").layout,
    intersectNode = require("./intersect").node,
    addTextLabel = require("./label/add-text-label"),
    addHtmlLabel = require("./label/add-html-label"),
    util = require("./util"),
    d3 = require("./d3");

module.exports = Renderer;

function Renderer() {
  // Set up defaults...
  this._layout = layout();

  this.drawNodes(defaultDrawNodes);
  this.drawEdgeLabels(defaultDrawEdgeLabels);
  this.drawEdgePaths(defaultDrawEdgePaths);
  this.positionNodes(defaultPositionNodes);
  this.positionEdgeLabels(defaultPositionEdgeLabels);
  this.positionEdgePaths(defaultPositionEdgePaths);
  this.transition(defaultTransition);
  this.postLayout(defaultPostLayout);
  this.postRender(defaultPostRender);

  this.edgeInterpolate("bundle");
  this.edgeTension(0.95);
}

Renderer.prototype.layout = function(layout) {
  if (!arguments.length) { return this._layout; }
  this._layout = layout;
  return this;
};

Renderer.prototype.drawNodes = function(drawNodes) {
  if (!arguments.length) { return this._drawNodes; }
  this._drawNodes = bind(drawNodes, this);
  return this;
};

Renderer.prototype.drawEdgeLabels = function(drawEdgeLabels) {
  if (!arguments.length) { return this._drawEdgeLabels; }
  this._drawEdgeLabels = bind(drawEdgeLabels, this);
  return this;
};

Renderer.prototype.drawEdgePaths = function(drawEdgePaths) {
  if (!arguments.length) { return this._drawEdgePaths; }
  this._drawEdgePaths = bind(drawEdgePaths, this);
  return this;
};

Renderer.prototype.positionNodes = function(positionNodes) {
  if (!arguments.length) { return this._positionNodes; }
  this._positionNodes = bind(positionNodes, this);
  return this;
};

Renderer.prototype.positionEdgeLabels = function(positionEdgeLabels) {
  if (!arguments.length) { return this._positionEdgeLabels; }
  this._positionEdgeLabels = bind(positionEdgeLabels, this);
  return this;
};

Renderer.prototype.positionEdgePaths = function(positionEdgePaths) {
  if (!arguments.length) { return this._positionEdgePaths; }
  this._positionEdgePaths = bind(positionEdgePaths, this);
  return this;
};

Renderer.prototype.transition = function(transition) {
  if (!arguments.length) { return this._transition; }
  this._transition = bind(transition, this);
  return this;
};

Renderer.prototype.postLayout = function(postLayout) {
  if (!arguments.length) { return this._postLayout; }
  this._postLayout = bind(postLayout, this);
  return this;
};

Renderer.prototype.postRender = function(postRender) {
  if (!arguments.length) { return this._postRender; }
  this._postRender = bind(postRender, this);
  return this;
};

Renderer.prototype.edgeInterpolate = function(edgeInterpolate) {
  if (!arguments.length) { return this._edgeInterpolate; }
  this._edgeInterpolate = edgeInterpolate;
  return this;
};

Renderer.prototype.edgeTension = function(edgeTension) {
  if (!arguments.length) { return this._edgeTension; }
  this._edgeTension = edgeTension;
  return this;
};

Renderer.prototype.run = function(graph, svg) {
  // First copy the input graph so that it is not changed by the rendering
  // process.
  graph = copyAndInitGraph(graph);

  // Create layers
  svg
    .selectAll("g.edgePaths, g.edgeLabels, g.nodes")
    .data(["edgePaths", "edgeLabels", "nodes"])
    .enter()
      .append("g")
      .attr("class", function(d) { return d; });

  // Create node and edge roots, attach labels, and capture dimension
  // information for use with layout.
  var svgNodes = this._drawNodes(graph, svg.select("g.nodes"));
  var svgEdgeLabels = this._drawEdgeLabels(graph, svg.select("g.edgeLabels"));

  svgNodes.each(function(u) { calculateDimensions(this, graph.node(u)); });
  svgEdgeLabels.each(function(e) { calculateDimensions(this, graph.edge(e)); });

  // Now apply the layout function
  var result = runLayout(graph, this._layout);

  // Copy useDef attribute from input graph to output graph
  graph.eachNode(function(u, a) {
    if (a.useDef) {
      result.node(u).useDef = a.useDef;
    }
  });

  // Run any user-specified post layout processing
  this._postLayout(result, svg);

  var svgEdgePaths = this._drawEdgePaths(graph, svg.select("g.edgePaths"));

  // Apply the layout information to the graph
  this._positionNodes(result, svgNodes);
  this._positionEdgeLabels(result, svgEdgeLabels);
  this._positionEdgePaths(result, svgEdgePaths, svg);

  this._postRender(result, svg);

  return result;
};

function copyAndInitGraph(g) {
  var copy = g.copy(),
      graph = copy.graph();

  if (graph === undefined) {
    copy.graph({});
    graph = copy.graph();
  }

  if (!graph.hasOwnProperty("arrowheadFix")) {
    graph.arrowheadFix = true;
  }

  // Init labels if they were not present in the source graph
  copy.nodes().forEach(function(v) {
    var node = copyObject(copy.node(v));
    copy.node(v, node);
    if (!node.hasOwnProperty("label")) { node.label = ""; }
  });

  copy.edges().forEach(function(e) {
    var edge = copyObject(copy.edge(e));
    copy.edge(e, edge);
    if (!edge.hasOwnProperty("label")) { edge.label = ""; }
  });

  return copy;
}

function copyObject(obj) {
  var copy = {};
  for (var k in obj) {
    copy[k] = obj[k];
  }
  return copy;
}

function calculateDimensions(group, value) {
  var bbox = group.getBBox();
  value.width = bbox.width;
  value.height = bbox.height;
}

function runLayout(graph, layout) {
  var result = layout.run(graph);

  // Copy labels to the result graph
  graph.eachNode(function(u, value) { result.node(u).label = value.label; });
  graph.eachEdge(function(e, u, v, value) { result.edge(e).label = value.label; });

  return result;
}

function defaultDrawNodes(g, root) {
  var nodes = g.nodes().filter(function(u) { return !util.isSubgraph(g, u); });

  var svgNodes = root
    .selectAll("g.node")
    .classed("enter", false)
    .data(nodes, function(u) { return u; });

  svgNodes.selectAll("*").remove();

  svgNodes
    .enter()
      .append("g")
        .style("opacity", 0)
        .attr("class", "node enter");

  svgNodes.each(function(u) {
    var attrs = g.node(u),
        domNode = d3.select(this);
    addLabel(attrs, domNode, true, 10, 10);
  });

  this._transition(svgNodes.exit())
      .style("opacity", 0)
      .remove();

  return svgNodes;
}

function defaultDrawEdgeLabels(g, root) {
  var svgEdgeLabels = root
    .selectAll("g.edgeLabel")
    .classed("enter", false)
    .data(g.edges(), function (e) { return e; });

  svgEdgeLabels.selectAll("*").remove();

  svgEdgeLabels
    .enter()
      .append("g")
        .style("opacity", 0)
        .attr("class", "edgeLabel enter");

  svgEdgeLabels.each(function(e) { addLabel(g.edge(e), d3.select(this), false, 0, 0); });

  this._transition(svgEdgeLabels.exit())
      .style("opacity", 0)
      .remove();

  return svgEdgeLabels;
}

var defaultDrawEdgePaths = function(g, root) {
  var svgEdgePaths = root
    .selectAll("g.edgePath")
    .classed("enter", false)
    .data(g.edges(), function(e) { return e; });

  var DEFAULT_ARROWHEAD = "url(#arrowhead)",
      createArrowhead = DEFAULT_ARROWHEAD;
  if (!g.isDirected()) {
    createArrowhead = null;
  } else if (g.graph().arrowheadFix !== "false" && g.graph().arrowheadFix !== false) {
    createArrowhead = function() {
      var strokeColor = d3.select(this).style("stroke");
      if (strokeColor) {
        var id = "arrowhead-" + strokeColor.replace(/[^a-zA-Z0-9]/g, "_");
        getOrMakeArrowhead(root, id).style("fill", strokeColor);
        return "url(#" + id + ")";
      }
      return DEFAULT_ARROWHEAD;
    };
  }

  svgEdgePaths
    .enter()
      .append("g")
        .attr("class", "edgePath enter")
        .append("path")
          .style("opacity", 0);

  svgEdgePaths
    .selectAll("path")
    .each(function(e) { applyStyle(g.edge(e).style, d3.select(this)); })
    .attr("marker-end", createArrowhead);

  this._transition(svgEdgePaths.exit())
      .style("opacity", 0)
      .remove();

  return svgEdgePaths;
};

function defaultPositionNodes(g, svgNodes) {
  function transform(u) {
    var value = g.node(u);
    return "translate(" + value.x + "," + value.y + ")";
  }

  // For entering nodes, position immediately without transition
  svgNodes.filter(".enter").attr("transform", transform);

  this._transition(svgNodes)
      .style("opacity", 1)
      .attr("transform", transform);
}

function defaultPositionEdgeLabels(g, svgEdgeLabels) {
  function transform(e) {
    var value = g.edge(e);
    var point = findMidPoint(value.points);
    return "translate(" + point.x + "," + point.y + ")";
  }

  // For entering edge labels, position immediately without transition
  svgEdgeLabels.filter(".enter").attr("transform", transform);

  this._transition(svgEdgeLabels)
    .style("opacity", 1)
    .attr("transform", transform);
}

function defaultPositionEdgePaths(g, svgEdgePaths, root) {
  var interpolate = this._edgeInterpolate,
      tension = this._edgeTension;

  function calcPoints(e) {
    var value = g.edge(e);
    var source = g.node(g.incidentNodes(e)[0]);
    var target = g.node(g.incidentNodes(e)[1]);
    var points = value.points.slice();

    var p0 = points.length === 0 ? target : points[0];
    var p1 = points.length === 0 ? source : points[points.length - 1];

    points.unshift(intersectNode(source, p0, selectDef(source.useDef, root)));
    points.push(intersectNode(target, p1, selectDef(target.useDef, root)));

    return d3.svg.line()
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; })
      .interpolate(interpolate)
      .tension(tension)
      (points);
  }

  svgEdgePaths.filter(".enter").selectAll("path")
      .attr("d", calcPoints);

  this._transition(svgEdgePaths.selectAll("path"))
      .attr("d", calcPoints)
      .style("opacity", 1);
}

function selectDef(defName, root) {
  if (defName) {
    var node = root.select("defs #" + defName).node();
    if (node) {
      return node.childNodes[0];
    }
  }
}

// By default we do not use transitions
function defaultTransition(selection) {
  return selection;
}

function defaultPostLayout() {
  // Do nothing
}

function defaultPostRender(graph, root) {
  if (graph.isDirected()) {
    // Fill = #333 is for backwards compatibility
    getOrMakeArrowhead(root, "arrowhead")
      .attr("fill", "#333");
  }
}

function getOrMakeArrowhead(root, id) {
  var search = root.select("#" + id);
  if (!search.empty()) { return search; }

  var defs = root.select("defs");
  if (defs.empty()) {
    defs = root.append("svg:defs");
  }

  var marker =
    defs
      .append("svg:marker")
        .attr("id", id)
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 8)
        .attr("refY", 5)
        .attr("markerUnits", "strokeWidth")
        .attr("markerWidth", 8)
        .attr("markerHeight", 5)
        .attr("orient", "auto");

  marker
    .append("svg:path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z");

  return marker;
}

function addLabel(node, root, addingNode, marginX, marginY) {
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
    addHtmlLabel(label, labelSvg);
  } else {
    applyStyle(node.labelStyle, addTextLabel(label, labelSvg));
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

  if (addingNode) {
    applyStyle(node.style, rect);

    if (node.fill) {
      rect.style("fill", node.fill);
    }

    if (node.stroke) {
      rect.style("stroke", node.stroke);
    }

    if (node["stroke-width"]) {
      rect.style("stroke-width", node["stroke-width"] + "px");
    }

    if (node["stroke-dasharray"]) {
      rect.style("stroke-dasharray", node["stroke-dasharray"]);
    }

    if (node.href) {
      root
        .attr("class", root.attr("class") + " clickable")
        .on("click", function() {
          window.open(node.href);
        });
    }
  }
}

function findMidPoint(points) {
  var midIdx = points.length / 2;
  if (points.length % 2) {
    return points[Math.floor(midIdx)];
  } else {
    var p0 = points[midIdx - 1];
    var p1 = points[midIdx];
    return {x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2};
  }
}

function bind(func, thisArg) {
  // For some reason PhantomJS occassionally fails when using the builtin bind,
  // so we check if it is available and if not, use a degenerate polyfill.
  if (func.bind) {
    return func.bind(thisArg);
  }

  return function() {
    return func.apply(thisArg, arguments);
  };
}

function applyStyle(style, domNode) {
  if (style) {
    var currStyle = domNode.attr("style") || "";
    domNode.attr("style", currStyle + "; " + style);
  }
}

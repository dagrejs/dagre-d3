var layout = require('dagre').layout;

var d3;
try { d3 = require('d3'); } catch (_) { d3 = window.d3; }

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
  this.zoomSetup(defaultZoomSetup);
  this.zoom(defaultZoom);
  this.transition(defaultTransition);
  this.postLayout(defaultPostLayout);
  this.postRender(defaultPostRender);

  this.edgeInterpolate('bundle');
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

Renderer.prototype.zoomSetup = function(zoomSetup) {
  if (!arguments.length) { return this._zoomSetup; }
  this._zoomSetup = bind(zoomSetup, this);
  return this;
};

Renderer.prototype.zoom = function(zoom) {
  if (!arguments.length) { return this._zoom; }
  if (zoom) {
    this._zoom = bind(zoom, this);
  } else {
    delete this._zoom;
  }
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

  // Create zoom elements
  svg = this._zoomSetup(graph, svg);

  // Create layers
  svg
    .selectAll('g.edgePaths, g.edgeLabels, g.nodes')
    .data(['edgePaths', 'edgeLabels', 'nodes'])
    .enter()
      .append('g')
      .attr('class', function(d) { return d; });

  // Create node and edge roots, attach labels, and capture dimension
  // information for use with layout.
  var svgNodes = this._drawNodes(graph, svg.select('g.nodes'));
  var svgEdgeLabels = this._drawEdgeLabels(graph, svg.select('g.edgeLabels'));

  svgNodes.each(function(u) { calculateDimensions(this, graph.node(u)); });
  svgEdgeLabels.each(function(e) { calculateDimensions(this, graph.edge(e)); });

  // Now apply the layout function
  var result = runLayout(graph, this._layout);

  // Run any user-specified post layout processing
  this._postLayout(result, svg);

  var svgEdgePaths = this._drawEdgePaths(graph, svg.select('g.edgePaths'));

  // Apply the layout information to the graph
  this._positionNodes(result, svgNodes);
  this._positionEdgeLabels(result, svgEdgeLabels);
  this._positionEdgePaths(result, svgEdgePaths);

  this._postRender(result, svg);

  return result;
};

function copyAndInitGraph(graph) {
  var copy = graph.copy();

  // Init labels if they were not present in the source graph
  copy.nodes().forEach(function(u) {
    var value = copy.node(u);
    if (value === undefined) {
      value = {};
      copy.node(u, value);
    }
    if (!('label' in value)) { value.label = ''; }
  });

  copy.edges().forEach(function(e) {
    var value = copy.edge(e);
    if (value === undefined) {
      value = {};
      copy.edge(e, value);
    }
    if (!('label' in value)) { value.label = ''; }
  });

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
  var nodes = g.nodes().filter(function(u) { return !isComposite(g, u); });

  var svgNodes = root
    .selectAll('g.node')
    .classed('enter', false)
    .data(nodes, function(u) { return u; });

  svgNodes.selectAll('*').remove();

  svgNodes
    .enter()
      .append('g')
        .style('opacity', 0)
        .attr('class', 'node enter');

  svgNodes.each(function(u) { addLabel(g.node(u), d3.select(this), 10, 10); });

  this._transition(svgNodes.exit())
      .style('opacity', 0)
      .remove();

  return svgNodes;
}

function defaultDrawEdgeLabels(g, root) {
  var svgEdgeLabels = root
    .selectAll('g.edgeLabel')
    .classed('enter', false)
    .data(g.edges(), function (e) { return e; });

  svgEdgeLabels.selectAll('*').remove();

  svgEdgeLabels
    .enter()
      .append('g')
        .style('opacity', 0)
        .attr('class', 'edgeLabel enter');

  svgEdgeLabels.each(function(e) { addLabel(g.edge(e), d3.select(this), 0, 0); });

  this._transition(svgEdgeLabels.exit())
      .style('opacity', 0)
      .remove();

  return svgEdgeLabels;
}

var defaultDrawEdgePaths = function(g, root) {
  var svgEdgePaths = root
    .selectAll('g.edgePath')
    .classed('enter', false)
    .data(g.edges(), function(e) { return e; });

  svgEdgePaths
    .enter()
      .append('g')
        .attr('class', 'edgePath enter')
        .append('path')
          .style('opacity', 0)
          .attr('marker-end', 'url(#arrowhead)');

  this._transition(svgEdgePaths.exit())
      .style('opacity', 0)
      .remove();

  return svgEdgePaths;
};

function defaultPositionNodes(g, svgNodes) {
  function transform(u) {
    var value = g.node(u);
    return 'translate(' + value.x + ',' + value.y + ')';
  }

  // For entering nodes, position immediately without transition
  svgNodes.filter('.enter').attr('transform', transform);

  this._transition(svgNodes)
      .style('opacity', 1)
      .attr('transform', transform);
}

function defaultPositionEdgeLabels(g, svgEdgeLabels) {
  function transform(e) {
    var value = g.edge(e);
    var point = findMidPoint(value.points);
    return 'translate(' + point.x + ',' + point.y + ')';
  }

  // For entering edge labels, position immediately without transition
  svgEdgeLabels.filter('.enter').attr('transform', transform);

  this._transition(svgEdgeLabels)
    .style('opacity', 1)
    .attr('transform', transform);
}

function defaultPositionEdgePaths(g, svgEdgePaths) {
  var interpolate = this._edgeInterpolate,
      tension = this._edgeTension;

  function calcPoints(e) {
    var value = g.edge(e);
    var source = g.node(g.incidentNodes(e)[0]);
    var target = g.node(g.incidentNodes(e)[1]);
    var points = value.points.slice();

    var p0 = points.length === 0 ? target : points[0];
    var p1 = points.length === 0 ? source : points[points.length - 1];

    points.unshift(intersectRect(source, p0));
    // TODO: use bpodgursky's shortening algorithm here
    points.push(intersectRect(target, p1));

    return d3.svg.line()
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; })
      .interpolate(interpolate)
      .tension(tension)
      (points);
  }

  svgEdgePaths.filter('.enter').selectAll('path')
      .attr('d', calcPoints);

  this._transition(svgEdgePaths.selectAll('path'))
      .attr('d', calcPoints)
      .style('opacity', 1);
}

// By default we do not use transitions
function defaultTransition(selection) {
  return selection;
}

// Setup dom for zooming
function defaultZoomSetup(graph, svg) {
  var root = svg.property('ownerSVGElement');
  // If the svg node is the root, we get null, so set to svg.
  if (!root) { root = svg; }
  root = d3.select(root);

  if (root.select('rect.overlay').empty()) {
    // Create an overlay for capturing mouse events that don't touch foreground
    root.append('rect')
      .attr('class', 'overlay')
      .attr('width', '100%')
      .attr('height', '100%')
      .style('fill', 'none');

    // Capture the zoom behaviour from the svg
    svg = svg.append('g')
      .attr('class', 'zoom');

    if (this._zoom) {
      root.call(this._zoom(graph, svg));
    }
  }

  return svg;
}

// By default allow pan and zoom
function defaultZoom(graph, svg) {
  return d3.behavior.zoom().on('zoom', function() {
    svg.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
  });
}

function defaultPostLayout() {
  // Do nothing
}

function defaultPostRender(graph, root) {
  if (graph.isDirected() && root.select('#arrowhead').empty()) {
    root
      .append('svg:defs')
        .append('svg:marker')
          .attr('id', 'arrowhead')
          .attr('viewBox', '0 0 10 10')
          .attr('refX', 8)
          .attr('refY', 5)
          .attr('markerUnits', 'strokeWidth')
          .attr('markerWidth', 8)
          .attr('markerHeight', 5)
          .attr('orient', 'auto')
          .attr('style', 'fill: #333')
          .append('svg:path')
            .attr('d', 'M 0 0 L 10 5 L 0 10 z');
  }
}

function addLabel(node, root, marginX, marginY) {
  // Add the rect first so that it appears behind the label
  var label = node.label;
  var rect = root.append('rect');
  var labelSvg = root.append('g');

  if (label[0] === '<') {
    addForeignObjectLabel(label, labelSvg);
    // No margin for HTML elements
    marginX = marginY = 0;
  } else {
    addTextLabel(label,
                 labelSvg,
                 Math.floor(node.labelCols),
                 node.labelCut);
  }

  var bbox = root.node().getBBox();

  labelSvg.attr('transform',
             'translate(' + (-bbox.width / 2) + ',' + (-bbox.height / 2) + ')');

  rect
    .attr('rx', 5)
    .attr('ry', 5)
    .attr('x', -(bbox.width / 2 + marginX))
    .attr('y', -(bbox.height / 2 + marginY))
    .attr('width', bbox.width + 2 * marginX)
    .attr('height', bbox.height + 2 * marginY);
}

function addForeignObjectLabel(label, root) {
  var fo = root
    .append('foreignObject')
      .attr('width', '100000');

  var w, h;
  fo
    .append('xhtml:div')
      .style('float', 'left')
      // TODO find a better way to get dimensions for foreignObjects...
      .html(function() { return label; })
      .each(function() {
        w = this.clientWidth;
        h = this.clientHeight;
      });

  fo
    .attr('width', w)
    .attr('height', h);
}

function addTextLabel(label, root, labelCols, labelCut) {
  if (labelCut === undefined) labelCut = 'false';
  labelCut = (labelCut.toString().toLowerCase() === 'true');

  var node = root
    .append('text')
    .attr('text-anchor', 'left');

  label = label.replace(/\\n/g, '\n');

  var arr = labelCols ? wordwrap(label, labelCols, labelCut) : label;
  arr = arr.split('\n');
  for (var i = 0; i < arr.length; i++) {
    node
      .append('tspan')
        .attr('dy', '1em')
        .attr('x', '1')
        .text(arr[i]);
  }
}

// Thanks to
// http://james.padolsey.com/javascript/wordwrap-for-javascript/
function wordwrap (str, width, cut, brk) {
     brk = brk || '\n';
     width = width || 75;
     cut = cut || false;

     if (!str) { return str; }

     var regex = '.{1,' +width+ '}(\\s|$)' + (cut ? '|.{' +width+ '}|.+$' : '|\\S+?(\\s|$)');

     return str.match( new RegExp(regex, 'g') ).join( brk );
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

function intersectRect(rect, point) {
  var x = rect.x;
  var y = rect.y;

  // For now we only support rectangles

  // Rectangle intersection algorithm from:
  // http://math.stackexchange.com/questions/108113/find-edge-between-two-boxes
  var dx = point.x - x;
  var dy = point.y - y;
  var w = rect.width / 2;
  var h = rect.height / 2;

  var sx, sy;
  if (Math.abs(dy) * w > Math.abs(dx) * h) {
    // Intersection is top or bottom of rect.
    if (dy < 0) {
      h = -h;
    }
    sx = dy === 0 ? 0 : h * dx / dy;
    sy = h;
  } else {
    // Intersection is left or right of rect.
    if (dx < 0) {
      w = -w;
    }
    sx = w;
    sy = dx === 0 ? 0 : w * dy / dx;
  }

  return {x: x + sx, y: y + sy};
}

function isComposite(g, u) {
  return 'children' in g && g.children(u).length;
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

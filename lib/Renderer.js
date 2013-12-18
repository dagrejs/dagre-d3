var layout = require('dagre').layout;

var d3;
try { d3 = require('d3'); } catch (_) { d3 = window.d3; }

module.exports = Renderer;

function Renderer() {
  this._layout = layout();
  this._drawNodes = defaultDrawNodes;
  this._drawEdgeLabels = defaultDrawEdgeLabels;
  this._drawEdgePaths = defaultDrawEdgePaths;
  this._postLayout = defaultPostLayout;
  this._postRender = defaultPostRender;
}

Renderer.prototype.layout = function(layout) {
  if (!arguments.length) { return this._layout; }
  this._layout = layout;
  return this;
};

Renderer.prototype.drawNodes = function(drawNodes) {
  if (!arguments.length) { return this._drawNodes; }
  this._drawNodes = drawNodes;
  return this;
};

Renderer.prototype.drawEdgeLabels = function(drawEdgeLabels) {
  if (!arguments.length) { return this._drawEdgePathsLabels; }
  this._drawEdgePathsLabels = drawEdgeLabels;
  return this;
};

Renderer.prototype.drawEdgePaths = function(drawEdgePathss) {
  if (!arguments.length) { return this._drawEdgePaths; }
  this._drawEdgePaths = drawEdgePaths;
  return this;
};

Renderer.prototype.postLayout = function(postLayout) {
  if (!arguments.length) { return this._postLayout; }
  this._postLayout = postLayout;
  return this;
};

Renderer.prototype.postRender = function(postRender) {
  if (!arguments.length) { return this._postRender; }
  this._postRender = postRender;
  return this;
};

Renderer.prototype.run = function(graph, svg) {
  // First copy the input graph so that it is not changed by the rendering
  // process.
  graph = copyAndInitGraph(graph);

  // Create layers
  svg
    .selectAll('g')
    .data(['edgePaths', 'edgeLabels', 'nodes'])
    .enter()
      .append('g')
      .attr('class', function(d) { return d; });


  // Create node and edge roots, attach labels, and capture dimension
  // information for use with layout.
  var svgNodes = this._drawNodes(graph, svg.select('g .nodes'));
  var svgEdgeLabels = this._drawEdgeLabels(graph, svg.select('g .edgeLabels'));

  svgNodes.each(function(u) { calculateDimensions(this, graph.node(u)); });
  svgEdgeLabels.each(function(e) { calculateDimensions(this, graph.edge(e)); });

  // Now apply the layout function
  var result = runLayout(graph, this._layout);

  // Run any user-specified post layout processing
  this._postLayout(result, svg);

  var svgEdgePaths = this._drawEdgePaths(result, svg.select('g .edgePaths'));

  // Apply the layout information to the graph
  reposition(result, svgNodes, svgEdgeLabels);

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

function reposition(graph, svgNodes, svgEdgeLabels) {
  svgNodes
    .attr('transform', function(u) {
      var value = graph.node(u);
      return 'translate(' + value.x + ',' + value.y + ')';
    });

  svgEdgeLabels
    .attr('transform', function(e) {
      var value = graph.edge(e);
      var point = findMidPoint(value.points);
      return 'translate(' + point.x + ',' + point.y + ')';
    });
}

function defaultDrawNodes(g, root) {
  var nodes = g.nodes().filter(function(u) { return !isComposite(g, u); });

  var svgNodes = root.selectAll('g .node').data(nodes);
  svgNodes
    .enter()
      .append('g')
        .attr('class', 'node')
        .each(function(u) { addLabel(g.node(u).label, d3.select(this), 10, 10); });

  return svgNodes;
}

function defaultDrawEdgeLabels(g, root) {
  var svgEdgeLabels = root.selectAll('g .edgeLabel').data(g.edges());

  svgEdgeLabels
    .enter()
      .append('g')
        .attr('class', 'edgeLabel')
        .each(function(e) { addLabel(g.edge(e).label, d3.select(this), 0, 0); });

  return svgEdgeLabels;
}

var edgeInterpolate = 'bundle',
    edgeTension = 0.95;

var defaultDrawEdgePaths = function(g, root) {
  var svgEdgePaths = root.selectAll('g .edgePath').data(g.edges());
  svgEdgePaths
    .enter()
      .append('g')
        .attr('class', 'edgePath')
        .append('path')
          .attr('marker-end', 'url(#arrowhead)')
          .attr('d', function(e) {
            var value = g.edge(e);
            var source = g.node(g.incidentNodes(e)[0]);
            var target = g.node(g.incidentNodes(e)[1]);
            var points = value.points;

            var p0 = points.length === 0 ? target : points[0];
            var p1 = points.length === 0 ? source : points[points.length - 1];

            points.unshift(intersectRect(source, p0));
            // TODO: use bpodgursky's shortening algorithm here
            points.push(intersectRect(target, p1));

            return d3.svg.line()
              .x(function(d) { return d.x; })
              .y(function(d) { return d.y; })
              .interpolate(edgeInterpolate)
              .tension(edgeTension)
              (points);
          });
  return svgEdgePaths;
};

defaultDrawEdgePaths.interpolate = function() {
  if (!arguments.length) return edgeInterpolate;
  edgeInterpolate = arguments[0];
  return defaultDrawEdgePaths;
};

defaultDrawEdgePaths.tension = function() {
  if (!arguments.length) return edgeTension;
  edgeTension = arguments[0];
  return defaultDrawEdgePaths;
};


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
          .attr('markerUnits', 'strokewidth')
          .attr('markerWidth', 8)
          .attr('markerHeight', 5)
          .attr('orient', 'auto')
          .attr('style', 'fill: #333')
          .append('svg:path')
            .attr('d', 'M 0 0 L 10 5 L 0 10 z');
  }
}

function addLabel(label, root, marginX, marginY) {
  // Add the rect first so that it appears behind the label
  var rect = root.append('rect');
  var labelSvg = root.append('g');

  if (label[0] === '<') {
    addForeignObjectLabel(label, labelSvg);
    // No margin for HTML elements
    marginX = marginY = 0;
  } else {
    addTextLabel(label, labelSvg);
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

function addTextLabel(label, root) {
  root
    .append('text')
    .attr('text-anchor', 'left')
    .append('tspan')
      .attr('dy', '1em')
      .text(function() { return label; });
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

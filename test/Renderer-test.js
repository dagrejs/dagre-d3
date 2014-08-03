/* Commonly used names */
describe('Renderer', function() {
  var renderer,
      svg;

  /**
   * Returns the browser-specific representation for the given color.
   */
  var toDOMColor = function(color) {
    var elem = svg.append('rect');
    elem.style('fill', color);
    try {
      return elem.style('fill');
    } finally {
      elem.remove();
    }
  };

  beforeEach(function() {
    svg = d3.select('svg');
    renderer = new Renderer();

    // Assign ids to all nodes and edges to simplify getting them later
    // TODO: make this reusable, as this is likely a common need
    var oldDrawNodes = renderer.drawNodes();
    renderer.drawNodes(function(g, dom) {
      var domNodes = oldDrawNodes(g, dom);
      domNodes.attr('id', function(u) { return 'node-' + u; });
      return domNodes;
    });

    var oldDrawEdgeLabels = renderer.drawEdgeLabels();
    renderer.drawEdgeLabels(function(g, dom) {
      var domNodes = oldDrawEdgeLabels(g, dom);
      domNodes.attr('id', function(u) { return 'edgeLabel-' + u; });
      return domNodes;
    });

    var oldDrawEdgePaths = renderer.drawEdgePaths();
    renderer.drawEdgePaths(function(g, dom) {
      var domNodes = oldDrawEdgePaths(g, dom);
      domNodes.attr('id', function(u) { return 'edgePath-' + u; });
      return domNodes;
    });
  });

  afterEach(function() {
    svg.selectAll('*').remove();
  });

  it('does not change the input graph attributes', function() {
    var input = new Digraph();
    input.addNode(1, {});
    input.addNode(2, {});
    input.addEdge('A', 1, 2, {});

    renderer.run(input, svg);

    expect(input.node(1)).to.deep.equal({});
    expect(input.node(2)).to.deep.equal({});
    expect(input.edge('A')).to.deep.equal({});
  });

  it('creates DOM nodes for each node in the graph', function() {
    var input = new Digraph();
    input.addNode(1, {});
    input.addNode(2, {});

    renderer.run(input, svg);

    expect(d3.select('#node-1').empty()).to.be.false;
    expect(d3.select('#node-1 rect').empty()).to.be.false;
    expect(d3.select('#node-1 text').empty()).to.be.false;
    expect(d3.select('#node-2').empty()).to.be.false;
  });

  it('creates DOM nodes for each edge path in the graph', function() {
    var input = new Digraph();
    input.addNode(1, {});
    input.addNode(2, {});
    input.addEdge('A', 1, 2, {});

    renderer.run(input, svg);

    expect(d3.select('#edgePath-A').empty()).to.be.false;
    expect(d3.select('#edgePath-A path').empty()).to.be.false;
  });

  it('creates DOM nodes for each edge label in the graph', function() {
    var input = new Digraph();
    input.addNode(1, {});
    input.addNode(2, {});
    input.addEdge('A', 1, 2, {});

    renderer.run(input, svg);

    expect(d3.select('#edgeLabel-A').empty()).to.be.false;
    expect(d3.select('#edgeLabel-A text').empty()).to.be.false;
  });

  describe('styling', function() {
    it('styles nodes with the "style" attribute', function() {
      var input = new Digraph();
      input.addNode(1, { style: 'fill: #ff0000' });

      renderer.run(input, svg);

      expect(d3.select('#node-1 rect').style('fill')).to.equal(toDOMColor('#ff0000'));
    });

    it('styles node labels with the "styleLabel" attribute', function() {
      var input = new Digraph();
      input.addNode(1, { labelStyle: 'fill: #ff0000' });

      renderer.run(input, svg);

      expect(d3.select('#node-1 text').style('fill')).to.equal(toDOMColor('#ff0000'));
    });

    it('styles edge paths with the "style" attribute', function() {
      var input = new Digraph();
      input.addNode(1, {});
      input.addNode(2, {});
      input.addEdge('A', 1, 2, { style: 'stroke: #ff0000' });

      renderer.run(input, svg);

      expect(d3.select('#edgePath-A path').style('stroke')).to.equal(toDOMColor('#ff0000'));
    });

    it('styles edge labels with the "styleLabel" attribute', function() {
      var input = new Digraph();
      input.addNode(1, {});
      input.addNode(2, {});
      input.addEdge('A', 1, 2, { labelStyle: 'fill: #ff0000' });

      renderer.run(input, svg);

      expect(d3.select('#edgeLabel-A text').style('fill')).to.equal(toDOMColor('#ff0000'));
    });
  });

  describe('marker-end', function() {
    it('is not used when the graph is undirected', function() {
      var input = new Graph();
      input.addNode(1, {});
      input.addNode(2, {});
      input.addEdge('A', 1, 2, {});

      renderer.run(input, svg);

      expect(d3.select('#edgePath-A path').attr('marker-end')).to.be.null;
    });

    it('defaults the marker\'s fill to the path\'s stroke color', function() {
      var input = new Digraph();
      input.addNode(1, {});
      input.addNode(2, {});
      input.addEdge('A', 1, 2, { style: 'stroke: #ff0000' });

      renderer.run(input, svg);

      var markerEnd = d3.select('#edgePath-A path').attr('marker-end'),
          pattern = /url\((#[A-Za-z0-9-_]+)\)$/;
      expect(markerEnd).to.match(pattern);
      var id = markerEnd.match(pattern)[1];
      expect(d3.select(id).style('fill')).to.equal(toDOMColor('#ff0000'));
    });

    it('is set to #arrowhead when the arrowheadFix attribute is false for the graph', function() {
      var input = new Digraph();
      input.graph({ arrowheadFix: false });
      input.addNode(1, {});
      input.addNode(2, {});
      input.addEdge('A', 1, 2, {});

      renderer.run(input, svg);

      expect(d3.select('#edgePath-A path').attr('marker-end')).to.equal('url(#arrowhead)');
    });
  });
});


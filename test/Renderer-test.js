/* Commonly used names */
describe('Renderer', function() {
  var renderer,
      svg;

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
    expect(d3.select('#node-2').empty()).to.be.false;
  });

  describe('styling', function() {
    it('styles nodes with the "style" attribute', function() {
      var input = new Digraph();
      input.addNode(1, { style: 'fill: #ff0000' });

      renderer.run(input, svg);

      expect(d3.select('#node-1 rect').style('fill')).to.equal('#ff0000');
    });
  });
});

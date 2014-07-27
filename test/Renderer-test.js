/* Commonly used names */
describe('Renderer', function() {
  var renderer,
      svg;

  beforeEach(function() {
    svg = d3.select('svg');
    renderer = new Renderer();
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
});

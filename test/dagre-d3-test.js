var expect = chai.expect;

describe("dagreD3", function() {
  var svg,
      g;

  beforeEach(function() {
    svg = d3.select("body").append("svg");
    g = new dagreD3.graphlib.Graph().setGraph({});
  });

  afterEach(function() {
    svg.remove();
  });

  describe("exports", function() {
    _.each(["graphlib", "dagre", "intersect", "util"], function(lib) {
      it(lib, function() {
        expect(dagreD3[lib]).to.be.an("object");
      });
    });

    it("render", function() {
      expect(dagreD3.render).to.be.a("function");
    });

    it("version", function() {
      expect(dagreD3.version).to.be.a("string");
    });
  });

  it("creates elements for each node", function() {
    g.setNode("a", { id: "a" });
    g.setNode("b", { id: "b" });
    dagreD3.render()(svg, g);

    expect(d3.select("#a").datum()).to.equal("a");
    expect(d3.select("#b").datum()).to.equal("b");
  });
});

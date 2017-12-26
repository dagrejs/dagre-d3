var expect = chai.expect;

d3.select("body").append("link")
  .attr("rel", "stylesheet")
  .attr("href", "/base/test/bundle-test.css");

describe("dagreD3", function() {
  var svg,
      g;

  beforeEach(function() {
    svg = d3.select("body").append("svg");
    g = new dagreD3.graphlib.Graph()
      .setGraph({})
      .setDefaultNodeLabel(function() { return {}; })
      .setDefaultEdgeLabel(function() { return {}; });
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

  describe("DOM elements", function() {
    it("are created for each node", function() {
      g.setNode("a", { id: "a" });
      g.setNode("b", { id: "b" });
      dagreD3.render()(svg, g);

      expect(d3.select("#a").datum()).to.equal("a");
      expect(d3.select("#b").datum()).to.equal("b");

      // We should also be able to get to the element from the node object.
      expect(g.node("a").elem).to.equal(d3.select("#a").node());
      expect(g.node("b").elem).to.equal(d3.select("#b").node());
    });

    it("are created for each node label", function() {
      g.setNode("a", { labelId: "a-lab" });
      g.setNode("b", { labelId: "b-lab" });
      dagreD3.render()(svg, g);

      expect(d3.select("#a-lab").datum()).to.equal("a");
      expect(d3.select("#b-lab").datum()).to.equal("b");
    });

    it("are created for each edge", function() {
      g.setNode("a", {});
      g.setNode("b", {});
      g.setEdge("a", "b", { id: "ab" });
      dagreD3.render()(svg, g);

      expect(d3.select("#ab").datum()).eqls({ v: "a", w: "b" });

      // We should also be able to get to the element from the edge object.
      expect(g.edge("a", "b").elem).to.equal(d3.select("#ab").node());
    });

    it("preserve link to the elem even after re-rendering", function() {
      g.setNode("a", {});
      g.setNode("b", {});
      g.setEdge("a", "b", { id: "ab" });
      dagreD3.render()(svg, g);

      // Remove elem from edge object and re-render
      g.setEdge("a", "b", { id: "ab" });
      dagreD3.render()(svg, g);

      expect(g.edge("a", "b").elem).to.equal(d3.select("#ab").node());
    });

    it("are created for each edge label", function() {
      g.setNode("a", {});
      g.setNode("b", {});
      g.setEdge("a", "b", { labelId: "ab-lab" });
      dagreD3.render()(svg, g);

      expect(d3.select("#ab-lab").datum()).eqls({ v: "a", w: "b" });
    });
  });

  it("uses node's width and height if specified", function() {
    g.setNode("a", { id: "a", width: 1000, height: 2000, padding: 0 });
    dagreD3.render()(svg, g);

    expect(Math.round(d3.select("#a").node().getBBox().width)).to.equal(1000);
    expect(Math.round(d3.select("#a").node().getBBox().height)).to.equal(2000);
  });

  it("does not grow node dimensions when re-rendering", function() {
    g.setNode("a", { id: "a" });
    dagreD3.render()(svg, g);
    var bbox = svg.select("#a rect").node().getBBox();

    dagreD3.render()(svg, g);
    var bbox2 = svg.select("#a rect").node().getBBox();

    expect(bbox.width).equals(bbox2.width);
    expect(bbox.height).equals(bbox2.height);
  });

  it("does not grow edge dimensions when re-rendering", function() {
    g.setNode("a");
    g.setNode("b");
    g.setEdge("a", "b", { labelId: "ab", label: "foo" });
    dagreD3.render()(svg, g);
    var bbox = svg.select("#ab").node().getBBox();

    dagreD3.render()(svg, g);
    var bbox2 = svg.select("#ab").node().getBBox();

    expect(bbox.width).equals(bbox2.width);
    expect(bbox.height).equals(bbox2.height);
  });

  describe("HTML labels", function() {
    it("can be created for a node", function() {
      g.setNode("a", { labelType: "html", label: "<p id='a-lab'>Hello</p>" });
      dagreD3.render()(svg, g);

      expect(d3.select("#a-lab").empty()).to.be.false;
      expect(d3.select("#a-lab").text()).equals("Hello");
    });

    it("can use an existing DOM element", function() {
      var elem = document.createElement("p");
      elem.setAttribute("id", "a-lab");
      elem.innerHTML = "Hello";

      g.setNode("a", { id: "a", labelType: "html", label: elem });
      dagreD3.render()(svg, g);

      expect(d3.select("#a #a-lab").empty()).to.be.false;
      expect(d3.select("#a #a-lab").text()).equals("Hello");
    });

    it("can use an function that returns a DOM element", function() {
      var elem = document.createElement("p");
      elem.setAttribute("id", "a-lab");
      elem.innerHTML = "Hello";

      g.setNode("a", { id: "a", labelType: "html", label: function() { return elem; } });
      dagreD3.render()(svg, g);

      expect(d3.select("#a #a-lab").empty()).to.be.false;
      expect(d3.select("#a #a-lab").text()).equals("Hello");
    });

    it("can be created for an edge", function() {
      g.setNode("a", {});
      g.setNode("b", {});
      g.setEdge("a", "b", { labelType: "html", label: "<p id='ab-lab'>Hello</p>" });
      dagreD3.render()(svg, g);

      expect(d3.select("#ab-lab").empty()).to.be.false;
      expect(d3.select("#ab-lab").text()).equals("Hello");
    });
  });

  describe("SVG labels", function() {
    it("can be created for a node", function() {
      link = document.createElementNS('http://www.w3.org/2000/svg', 'a');
      link.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', 'http://google.com/');
      link.setAttribute('target', '_blank');
      link.setAttribute('id', 'a-lab');
      link.textContent = 'Google';

      g.setNode("a", { labelType: "svg", label: link });
      dagreD3.render()(svg, g);

      expect(d3.select("#a-lab").empty()).to.be.false;
      expect(d3.select("#a-lab").text()).equals("Google");
    });

    it("can be created for an edge", function() {
      link = document.createElementNS('http://www.w3.org/2000/svg', 'a');
      link.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', 'http://yahoo.com/');
      link.setAttribute('target', '_blank');
      link.setAttribute('id', 'ab-lab');
      link.textContent = 'Yahoo';

      g.setNode("a", {});
      g.setNode("b", {});
      g.setEdge("a", "b", { labelType: "svg", label: link });
      dagreD3.render()(svg, g);

      expect(d3.select("#ab-lab").empty()).to.be.false;
      expect(d3.select("#ab-lab").text()).equals("Yahoo");
    });
  });

  describe("breaks label lines", function() {
    it("on '\\n'", function() {
      g.setNode("a", { id: "a", label: "multi\nline" });
      dagreD3.render()(svg, g);

      var text = d3.select("#a text");
      expect(text.empty()).to.be.false;
      expect(d3.select(text.selectAll("tspan").nodes()[0]).text()).equals("multi");
      expect(d3.select(text.selectAll("tspan").nodes()[1]).text()).equals("line");
    });

    it("on '\\\\n'", function() {
      g.setNode("a", { id: "a", label: "multi\\nline" });
      dagreD3.render()(svg, g);

      var text = d3.select("#a text");
      expect(text.empty()).to.be.false;
      expect(d3.select(text.selectAll("tspan").nodes()[0]).text()).equals("multi");
      expect(d3.select(text.selectAll("tspan").nodes()[1]).text()).equals("line");
    });
  });

  describe("styles", function() {
    var canonicalRed;

    beforeEach(function() {
      // Each browser has a different way to represent colors canonically. We
      // create a dummy object here to get the canonical representation for the
      // color red.
      canonicalRed = svg.append("rect").style("fill", "#ff0000").style("fill");
    });

    it("can be applied to a node", function() {
      g.setNode("a", { id: "a", style: "fill: #ff0000", shape: "rect" });
      dagreD3.render()(svg, g);

      expect(d3.select("#a rect").style("fill")).to.equal(canonicalRed);
    });

    it("can be applied to a node label", function() {
      g.setNode("a", { labelId: "a-lab", labelStyle: "stroke: #ff0000" });
      dagreD3.render()(svg, g);

      expect(d3.select("#a-lab text").style("stroke")).to.equal(canonicalRed);
    });

    it("can be applied to an edge", function() {
      g.setNode("a", {});
      g.setNode("b", {});
      g.setEdge("a", "b", { id: "ab", style: "stroke: #ff0000" });
      dagreD3.render()(svg, g);

      expect(d3.select("#ab path").style("stroke")).to.equal(canonicalRed);
    });

    it("can be applied to an edge label", function() {
      g.setNode("a", {});
      g.setNode("b", {});
      g.setEdge("a", "b", { labelId: "ab-lab", labelStyle: "stroke: #ff0000" });
      dagreD3.render()(svg, g);

      expect(d3.select("#ab-lab text").style("stroke")).to.equal(canonicalRed);
    });
  });

  describe("shapes", function() {
    it("include a rect", function() {
      g.setNode("a", { id: "a", shape: "rect", width: 100, height: 200, padding: 0 });
      dagreD3.render()(svg, g);

      var rect = d3.select("#a rect");
      expect(rect.empty()).to.be.false;
      expect(rect.node().getBBox().width).to.equal(100);
      expect(rect.node().getBBox().height).to.equal(200);
    });

    it("include a circle", function() {
      g.setNode("a", { id: "a", shape: "circle", width: 100, height: 250, padding: 0 });
      dagreD3.render()(svg, g);

      var circle = d3.select("#a circle");
      expect(circle.empty()).to.be.false;
      // Should be half of greater of width, height
      expect(circle.attr("r") * 2).to.equal(250);
    });

    it("include an ellipse", function() {
      g.setNode("a", { id: "a", shape: "ellipse", width: 100, height: 250, padding: 0 });
      dagreD3.render()(svg, g);

      var ellipse = d3.select("#a ellipse");
      expect(ellipse.empty()).to.be.false;
      expect(ellipse.attr("rx") * 2).to.equal(100);
      expect(ellipse.attr("ry") * 2).to.equal(250);
    });
  });

  describe("class", function() {
    it("can be set for nodes", function() {
      g.setNode("a", { id: "a", class: function(d) { return d + "-class"; } });
      g.setNode("b", { id: "b", class: "b-class" });
      dagreD3.render()(svg, g);

      expect(d3.select("#a").classed("a-class")).to.be.true;
      expect(d3.select("#b").classed("b-class")).to.be.true;
    });

    it("can be set for edges", function() {
      g.setNode("a", { id: "a" });
      g.setNode("b", { id: "b" });
      g.setEdge("a", "b", { id: "c", class: function(d) { return d.v + d.w + "-class"; } });
      g.setEdge("b", "a", { id: "d", class: "d-class" });
      dagreD3.render()(svg, g);

      expect(d3.select("#c").classed("ab-class")).to.be.true;
      expect(d3.select("#d").classed("d-class")).to.be.true;
    });
  });
});

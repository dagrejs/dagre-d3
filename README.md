# dagre-d3 - A D3-based renderer for Dagre

[![Build Status](https://secure.travis-ci.org/cpettitt/dagre-d3.png?branch=master)](http://travis-ci.org/cpettitt/dagre-d3)

Dagre is a JavaScript library that makes it easy to lay out directed graphs on
the client-side. The dagre-d3 library acts a front-end to dagre, providing
actual rendering using [D3][].

Note that dagre-d3 is current a pre-1.0.0 library. We will do our best to
maintain backwards compatibility for patch level increases (e.g. 0.0.1 to
0.0.2) but make no claim to backwards compatibility across minor releases (e.g.
0.0.1 to 0.1.0). Watch our [CHANGELOG](CHANGELOG.md) for details on changes.

## Demo

Try our [interactive demo](http://cpettitt.github.com/project/dagre-d3/latest/demo/interactive-demo.html)!

Or some of our other examples:

* [Sentence Tokenization](http://cpettitt.github.com/project/dagre-d3/latest/demo/sentence-tokenization.html)
* [TCP State Diagram](http://cpettitt.github.com/project/dagre-d3/latest/demo/tcp-state-diagram.html)
    * [TCP State Diagram](http://cpettitt.github.com/project/dagre-d3/latest/demo/tcp-state-diagram-json.html) using JSON as input.

These demos and more can be found in the `demo` folder of the project. Simply
open them in your browser - there is no need to start a web server.

## Getting dagre-d3

### Browser Scrips

You can get the latest browser-ready scripts:

* [dagre-d3.js](http://cpettitt.github.io/project/dagre-d3/latest/dagre-d3.js)
* [dagre-d3.min.js](http://cpettitt.github.io/project/dagre-d3/latest/dagre-d3.min.js)

These scripts include everything you need to use dagre-d3. See Using Dagre
below for details.

### NPM Install

Before installing this library you need to install the [npm package manager].

To get dagre-d3 from npm, use:

    $ npm install dagre-d3

### Build From Source

Before building this library you need to install the [npm package manager].

Check out this project and run this command from the root of the project:

    $ make

This will generate `dagre-d3.js` and `dagre-d3.min.js` in the `dist` directory
of the project.

## Using dagre-d3

To use dagre-d3, there are a few basic steps:

1. Get the library
2. Create a graph
3. Render the graph
4. Optionally configure the layout

We'll walk through each of these steps below.

### Getting dagre-d3

First we need to load the dagre-d3 library. In an HTML page you do this by adding
the following snippet:

```html
<script src="http://d3js.org/d3.v3.min.js"></script>
<script src="http://cpettitt.github.io/project/dagre-d3/latest/dagre-d3.min.js"></script>
```

We recommend you use a specific version though, or include your own copy of the
library, because the API may change across releases. Here's an example of using
dagre-d3 v0.0.1:

```html
<script src="http://d3js.org/d3.v3.min.js"></script>
<script src="http://cpettitt.github.io/project/dagre-d3/v0.0.1/dagre-d3.min.js"></script>
```

This will add a new global `dagreD3`. We show you how to use this below.

### Creating a Graph

We use [graphlib](https://github.com/cpettitt/graphlib) to create graphs in
dagre, so its probably worth taking a look at its
[API](http://cpettitt.github.io/project/graphlib/latest/doc/index.html).
Graphlib comes bundled with dagre-d3. In this section, we'll show you how to
create a simple graph.

```js
// Create a new directed graph
var g = new dagreD3.Digraph();

// Add nodes to the graph. The first argument is the node id. The second is
// metadata about the node. In this case we're going to add labels to each of
// our nodes.
g.addNode("kspacey",    { label: "Kevin Spacey" });
g.addNode("swilliams",  { label: "Saul Williams" });
g.addNode("bpitt",      { label: "Brad Pitt" });
g.addNode("hford",      { label: "Harrison Ford" });
g.addNode("lwilson",    { label: "Luke Wilson" });
g.addNode("kbacon",     { label: "Kevin Bacon" });

// Add edges to the graph. The first argument is the edge id. Here we use null
// to indicate that an arbitrary edge id can be assigned automatically. The
// second argument is the source of the edge. The third argument is the target
// of the edge. The last argument is the edge metadata.
g.addEdge(null, "kspacey",   "swilliams", { label: "K-PAX" });
g.addEdge(null, "swilliams", "kbacon",    { label: "These Vagabond Shoes" });
g.addEdge(null, "bpitt",     "kbacon",    { label: "Sleepers" });
g.addEdge(null, "hford",     "lwilson",   { label: "Anchorman 2" });
g.addEdge(null, "lwilson",   "kbacon",    { label: "Telling Lies in America" });
```

This simple graph was derived from [The Oracle of
Bacon](http://oracleofbacon.org/).

### Rendering the Graph

To render the graph, we first need to create an SVG element on our page:

```html
<svg width=650 height=680>
    <g transform="translate(20,20)"/>
</svg>
```

Then we ask the renderer to draw our graph in the SVG element:

```js
var renderer = new dagreD3.Renderer();
renderer.run(g, d3.select("svg g"));
```

We also need to add some basic style information to get a usable graph. These values can be tweaked, of course.

```css
<style>
svg {
    overflow: hidden;
}

.node rect {
    stroke: #333;
    stroke-width: 1.5px;
    fill: #ff;
}

.edgeLabel rect {
    fill: #fff;
}

.edge path {
    stroke: #333;
    stroke-width: 1.5px;
    fill: none;
}
</style>
```

This produces the graph:

![oracle-of-bacon1.png](http://cpettitt.github.io/project/dagre-d3/static/oracle-of-bacon1.png)

### Configuring the Renderer

This section describes experimental rendering configuration.

* `renderer.edgeInterpolate(x)` sets the path interpolation used with d3. For a list of interpolation options, see the [D3 API](https://github.com/mbostock/d3/wiki/SVG-Shapes#wiki-line_interpolate).
* `renderer.edgeTension(x)` is used to set the tension for use with d3. See the [D3 API](https://github.com/mbostock/d3/wiki/SVG-Shapes#wiki-line_tension) for details.

For example, to set the edge interpolation to 'linear':

```js
renderer.edgeTension('linear');
renderer.run(g, d3.select('svg g'));
```

### Configuring the Layout

Here are a few methods you can call on the layout object to change layout behavior:

* `debugLevel(x)` sets the level of logging verbosity to the number `x`. Currently 4 is th max.
* `nodeSep(x)` sets the separation between adjacent nodes in the same rank to `x` pixels.
* `edgeSep(x)` sets the separation between adjacent edges in the same rank to `x` pixels.
* `rankSep(x)` sets the sepration between ranks in the layout to `x` pixels.
* `rankDir(x)` sets the direction of the layout.
    * Defaults to `"TB"` for top-to-bottom layout
    * `"LR"` sets layout to left-to-right

For example, to set node separation to 20 pixels and the rank direction to left-to-right:

```js
var layout = dagreD3.layout()
                    .nodeSep(20)
                    .rankDir("LR");
renderer.layout(layout).run(g, d3.select("svg g"));
```

This produces the following graph:

![oracle-of-bacon2.png](http://cpettitt.github.io/project/dagre-d3/static/oracle-of-bacon2.png)

## License

dagre-d3 is licensed under the terms of the MIT License. See the LICENSE file
for details.

[npm package manager]: http://npmjs.org/
[D3]: https://github.com/mbostock/d3

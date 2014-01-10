v0.1.2
======

* Pull in dagre v0.4.3 / graphlib v0.7.2 / cp-data v1.1.2

v0.1.1
======

* drawEdgePaths now gets the input graph as its first argument, not the layout
  graph. This makes it consistent with drawNodes and drawEdgeLabels.

v0.1.0
======

* Added support for D3 transitions. See interactive-demo.html for an example of
  how to set up transitions.
* Now edge paths are always behind edge labels and edge labels are always
  behind nodes. This has an impact on CSS selectors: edge labels are now
  selectable by '.edgeLabel' and edge paths are selectable by '.edgePath'.
  See the demos for examples of using the new selectors.
* Now draw functions are for all objects (e.g. drawNodes, instead of drawNode).
  Probably best to look at the demos to understand the change. This opens up
  the possibility for transitions across all objects, amonst other possibilities.
* Added experimental features for setting edge interpolation and tension. See
  README.md for details.

v0.0.11
=======

* Pull in dagre v0.4.2

v0.0.10
=======

* Pull in dagre v0.4.1

v0.0.9
======

* Pull in dagre v0.4.0
* Demos now auto-resize their SVG

v0.0.8
======

* Pull in dagre v0.3.8 (bug fix release)

v0.0.7
======

* Pull in dagre v0.3.7

v0.0.6
======

* Pull in dagre v0.3.6, which includes some fixes for edges in the output
  graph. It removes dummy edges from the output graph and ensures that edge ids
  are correctly preserved and added to the output graph.

v0.0.5
======

* Pull in dagre v0.3.4, which includes a fix for the demos with IE.

v0.0.4
======

* Pull in dagre v0.3.3

v0.0.3
======

* Ensure dagre-d3 works with non-composite graphs
* Fixed broken demos

v0.0.2
======

* Pull in dagre v0.3.1, which includes support for rank constraints.

v0.0.1
======

* Initial release

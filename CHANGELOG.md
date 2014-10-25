v0.3.2
======

* Add transitions support

v0.3.1
======

* Fix a bug that caused nodes to grow in size when they were re-rendered.

v0.3.0
======

* This version is a significant, **backwards incompatible** departure from v0.2.9.
  It is a step towards a more stable 1.0 release. See demos for examples of how
  to use the new APIs (dagre-d3, dagre, graphlib)
* Pick up new dagre and graphlib, which yields improved performance
* Experimental support for clusters
* Note that this version does not currently support transitions.

v0.2.9
======

* More tweaks to zoom handling.
* Added an example with a tooltip on hover.

v0.2.8
======

* Improved zoom handling.
* Improved demos.

v0.2.7
======

* Add support for styling nodes, node labels, edges, and paths.
* Add support for matching arrowhead fill to path stroke.
    * To disable this (revert to previous behavior), set the graph attribute arrowheadFix = false.

v0.2.6
======

* Testing new release script, no functional changes.

v0.2.5
======

* Added support for arbitrary shapes. See https://github.com/cpettitt/dagre-d3/pull/69 for details.
* Added support for publishing to bower.

v0.2.4
======

* Fix bug that would cause nodes to get larger each time an input graph was
  re-renderer.
* @dominiek added a new demo (`demo/etl-status.html`) showing how dagre-d3
  can be used to visualize an ETL pipeline.

v0.2.3
======

* Fix to allow fill to be set via CSS

v0.2.2
======

* PaulKlint added support for node style attributes:
    * width and height (this replaces the bbox strategy in v0.2.1)
    * stroke
    * stroke-width
    * stroke-dasharray
    * rx and ry

v0.2.1
======

* Now dagre-d3 will use user-supplied width and height if they are set as
  attributes on nodes and edges.

v0.2.0
======

* Misc bug fixes
* Added zoom behavior by default. Thanks to @kennib and @eightyeight for this
  feature. If zoom behavior is not desired, use `renderer.zoom(false)` (see
  `demo/sentence-tokenization.html` for an example).

v0.1.5
======

* Fixes to transitions:
    * Avoid overlapping transitions
    * Remove hack for adding an artificial control point because it breaks if
      edge interpolation changes.

v0.1.4
======

* Pull in dagre v0.4.5

v0.1.3
======

* Add support wordwrap for text labels (thanks @mmcgrath).
* Pull in latest cp-data, graphlib, and dagre.

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

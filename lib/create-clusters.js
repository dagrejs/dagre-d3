var util = require("./util");
var d3 = require("./d3");
var addLabel = require("./label/add-label");

module.exports = createClusters;

function createClusters(selection, g) {
  var clusters = g.nodes().filter(function(v) { return util.isSubgraph(g, v); });
  var svgClusters = selection.selectAll("g.cluster")
    .data(clusters, function(v) { return v; });

  var svgClustersEnter = svgClusters.enter().append('g')
    .attr("class", "cluster")
    .attr("id",function(v){
      var node = g.node(v);
      return node.id;
    })
    .style("opacity", 0);
  
  var svgClustersMerged = svgClusters.merge(svgClustersEnter);

  util.applyTransition(svgClustersMerged, g)
    .style("opacity", 1);

  svgClustersMerged.each(function(v) {
    var node = g.node(v);
    var thisGroup = d3.select(this);
    d3.select(this).append("rect");
    var labelGroup = thisGroup.append("g").attr("class", "label");
    addLabel(labelGroup, node, node.clusterLabelPos);
  });

  svgClustersMerged.selectAll("rect").each(function(c) {
    var node = g.node(c);
    var domCluster = d3.select(this);
    util.applyStyle(domCluster, node.style);
  });

  var exitSelection = svgClusters.exit();
  util.applyTransition(exitSelection, g)
    .style("opacity", 0)
    .remove();

  return svgClustersMerged;
}

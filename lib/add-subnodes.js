module.exports = addSubnodes;

function addSubnodes(root, node) {
  var subnodes = node.subnodes;
  var subnodeSvg;

  if (subnodes && subnodes.length) {
    subnodeSvg = root.append("g");

    for (var i = 0; i < subnodes.length; i++) {
      subnodeSvg.append("circle")
        .attr("cx", i * 22)
        .attr("cy", "0")
        .attr("r", "10");
    }
  }

  return subnodeSvg;
}

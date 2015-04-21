module.exports = addSubnodes;

function addSubnodes(root, node) {
  var subnodeGroup;

  subnodeGroup = root.append("g").attr("class", "subnodes"),
  subnodeGroup.selectAll("circle")
    .data(node.subnodes, function(subnode) { return subnode.id; })
    .enter().append("circle")
      .attr("cx", function(d, i) { return i * 22; })
      .attr("cy", "0")
      .attr("r", "10")
      .attr("class", function(d) { return d.class; });

  return subnodeGroup;
}




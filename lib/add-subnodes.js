module.exports = addSubnodes;

function addSubnodes(root, node) {
  var subnodesGroup = root.append("g").attr("class", "subnodes");
  subnodesGroup.selectAll("g")
    .data(node.subnodes, function(subnode) { return subnode.id; })
    .enter().append("g")
      .attr("class", "subnode")
      .each(function(d, i) {
        d3.select(this).append("circle")
          .attr("cx", i * 22)
          .attr("cy", "0")
          .attr("r", "10")
          .attr("class", d.class);
      });

  return subnodesGroup;
}




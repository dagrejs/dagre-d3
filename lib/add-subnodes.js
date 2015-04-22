module.exports = addSubnodes;

function addSubnodes(root, node) {
  var subnodesGroup = root.append("g").attr("class", "subnodes");
  subnodesGroup.selectAll("g")
    .data(node.subnodes)
    .enter().append("g")
      .attr("class", "subnode")
      .each(function(d, i) {
        // Create the circle and text nodes within the subnode group
        var circleDom = d3.select(this).append("circle")
          .data([d], function(d) {
            return d.id;
          })
          .attr("cx", i * 22)
          .attr("cy", "0")
          .attr("r", "10")
          .attr("class", d.class);
        var textDom = d3.select(this).append("text")
          .text(d.label)
          .attr("x", i * 22)
          .attr("y", "5");

        // Center the text within the circle
        var circleBox = circleDom.node().getBBox();
        var textBox = textDom.node().getBBox();
        textDom.attr("transform", "translate(" +
          -(textBox.width / 2) + "," +
          -((circleBox.height - textBox.height - 5) / 2) + ")");
      });

  return subnodesGroup;
}




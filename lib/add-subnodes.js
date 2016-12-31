module.exports = addSubnodes;

function addSubnodes(root, node) {
  var subnodesGroup = root.append("g").attr("class", "subnodes");
  subnodesGroup.selectAll("g")
    .data(node.subnodes)
    .enter().append("g")
      .attr("class", function(d) { return "subnode " + d.class; })
      .each(function(d, i) {
        const parent = d3.select(this);

        // Create the circle and text nodes within the subnode group
        var circleDom = parent.append("circle")
          .attr("cx", i * 22)
          .attr("cy", "0")
          .attr("r", "10");
        var textDom = parent.append("text")
          .text(d.label)
          .attr("x", i * 22)
          .attr("y", "5");

        // Center the text within the circle
        var circleBox = circleDom.node().getBBox();
        var textBox = textDom.node().getBBox();
        textDom.attr("transform", "translate(" +
          -(textBox.width / 2) + "," +
          -((circleBox.height - textBox.height - 5) / 2) + ")");

        // Make the tooltip if requested.
        if (d.tooltip) {
          const tooltipGroup = parent.append('g').attr('class', 'qc-tooltip');

          // Append the tooltip text and measure its dimensions so we can size the surrounding
          // rectangle.
          tooltipGroup.append('text')
            .text(d.ref['@type'][0])
            .attr('x', 5)
            .attr('y', 40);
          const labelBBox = tooltipGroup.node().getBBox();

          // Append the tooltip rectangle.
          tooltipGroup.insert('rect', 'text')
            .attr('x', 0)
            .attr('y', 30)
            .attr('width', labelBBox.width + 10)
            .attr('height', labelBBox.height + 5);
          const tooltipBBox = tooltipGroup.node().getBBox();

          // Center the group on the parent node for the width of the text.
          tooltipGroup.attr('transform', `translate(${(-tooltipBBox.width / 2) + (i * 22)},0)`);
        }
      });

  return subnodesGroup;
}

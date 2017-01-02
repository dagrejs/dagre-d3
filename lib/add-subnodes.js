module.exports = addSubnodes;

function addSubnodes(root, node) {
  var subnodesGroup = root.append("g").attr("class", "subnodes");
  subnodesGroup.selectAll("g")
    .data(node.subnodes)
    .enter().append("g")
      .attr("class", function(d) { return "subnode " + d.class; })
      .each(function(d, i) {
        const arrowWidth = 10; // Tooltip arrow dimensions width
        const arrowHeight = 8; // TOoltip arrow dimensions height
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
            .attr('y', arrowWidth + 22);
          const labelBBox = tooltipGroup.node().getBBox();

          // Insert the tooltip rectangle.
          tooltipGroup.insert('rect', 'text')
            .attr('x', 0)
            .attr('y', arrowWidth + 10)
            .attr('width', labelBBox.width + 10)
            .attr('height', labelBBox.height + 7);
          const tooltipBBox = tooltipGroup.node().getBBox();

          // Draw the little pointer above the tooltip box centered on the rect we just inserted.
          const arrowX = (tooltipBBox.width / 2) - (arrowWidth / 2);
          tooltipGroup.insert('polygon', 'text')
            .attr('points', `${arrowX},${arrowHeight + 10} ${arrowX + (arrowWidth / 2)},10 ${arrowX + arrowWidth},${arrowHeight + 10}`);

          // Center the group on the parent node for the width of the text.
          tooltipGroup.attr('transform', `translate(${(-tooltipBBox.width / 2) + (i * 22)},0)`);
        }
      });

  return subnodesGroup;
}

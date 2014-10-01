module.exports = addTextLabel;

/*
 * Attaches a text label to the specified root. Handles escape sequences.
 */
function addTextLabel(label, root) {
  var node = root.append("text");

  var lines = processEscapeSequences(label).split("\n");
  for (var i = 0; i < lines.length; i++) {
    node
      .append("tspan")
        .attr("dy", "1em")
        .attr("x", "1")
        .text(lines[i]);
  }

  return node;
}

function processEscapeSequences(text) {
  var newText = "",
      escaped = false,
      ch;
  for (var i = 0; i < text.length; ++i) {
    ch = text[i];
    if (escaped) {
      switch(ch) {
        case "n": newText += "\n"; break;
        default: newText += ch;
      }
      escaped = false;
    } else if (ch === "\\") {
      escaped = true;
    } else {
      newText += ch;
    }
  }
  return newText;
}

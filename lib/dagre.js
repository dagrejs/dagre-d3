/* global window */

var dagre;

if (require) {
  try {
    dagre = require("@dagrejs/dagre");
  } catch (e) {}
}

if (!dagre) {
  dagre = window.dagre;
}

module.exports = dagre;

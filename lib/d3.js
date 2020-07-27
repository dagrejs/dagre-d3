// Stub to get D3 either via NPM or from the global object
var d3;

if (!d3) {
  if (typeof require === "function") {
    try {
      d3 = Object.assign({}, require("d3-selection"), require("d3-shape"));
    }
    catch (e) {
      // continue regardless of error
    }
  }
}

if (!d3) {
  d3 = window.d3;
}

module.exports = d3;

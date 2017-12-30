// Stub to get D3 either via NPM or from the global object
var d3;

if (!d3) {
  if (require) {
    try {
      d3 = require("d3");
    }
    catch (e) {
    }
  }
}

if (!d3) {
  d3 = window.d3;
}

module.exports = d3;

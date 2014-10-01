// Stub to get D3 either via NPM or from the global object
var d3;
try { d3 = require("d3"); } catch (_) { d3 = window.d3; }
module.exports = d3;

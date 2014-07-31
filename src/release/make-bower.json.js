// Renders the bower.json template and prints it to stdout

var template = {
  name: 'dagre-d3',
  version: require('../../package.json').version,
  main: ['js/dagre-d3.js', 'js/dagre-d3.min.js'],
  ignore: [
    'README.md'
  ],
  dependencies: {
    'd3': '~3.3.8'
  }
};

console.log(JSON.stringify(template, null, 2));

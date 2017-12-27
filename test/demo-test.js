// A *very* simple test runner to ensure that the demos work as expected.
var webpage = require("webpage"),
    system = require("system"),
    stdout = system.stdout,
    stderr = system.stderr,
    // Too bad this replaces the more function fs module from nodejs...
    fs = require("fs"),
    start = new Date();

var red = "\033[31m";
var green = "\033[32m";
var grey = "\033[30;1m";
var reset = "\033[0m";

function htmlFile(file) { return file.match(/.*\.html/); }

fs.changeWorkingDirectory("./build/dist/demo");

var remaining =  {};
ls(".", htmlFile).forEach(function(f) { remaining[f] = true; });
var testCount = Object.keys(remaining).length;
var failures = [];

stdout.write("\n");
stdout.write(grey + "  ");

Object.keys(remaining).forEach(function(url) {
  stdout.write(".");
  var page = webpage.create();
  page.onError = function(msg, trace) {
    failures.push({ url: url, msg: msg, trace: trace });
    testDone(url);
  };
  page.onLoadFinished = function(status) {
    if (status !== "success") {
      failures.push({ url: url, msg: "Could not load page" });
    }
    testDone(url);
  };
  page.open(url, function() {});
});

function ls(dir, filter) {
  var set = [];
  fs.list(dir).forEach(function(file) {
    if (filter(file)) {
      set.push(dir + "/" + file);
    }
  });
  return set;
}

function testDone(url) {
  delete remaining[url];
  if (!Object.keys(remaining).length) {
    stdout.write(reset + "\n");
    stdout.write("\n");
    failures.forEach(function(failure) {
      stderr.write(red + "FAILED: " + failure.url + reset + "\n");
      stderr.write(grey);
      stderr.write("  " + failure.msg + "\n");
      if (failure.trace) {
        failure.trace.forEach(function(t) {
          stderr.write("    " + t.file + ": " + t.line + (t.function ? " (in function '" + t.function + "')" : "") + "\n");
        });
      }
      stderr.write(reset);
      stderr.write("\n");
    });
    stdout.write("  " + green + (testCount - failures.length) + " passing" + reset);
    if (failures.length) {
      stdout.write(" " + red + (failures.length) + " failing" + reset);
    }
    stdout.write(grey + " (" + (new Date() - start) + "ms)" + reset + "\n\n");
    phantom.exit(failures.length);
  }
}

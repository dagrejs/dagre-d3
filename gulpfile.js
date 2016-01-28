"use strict";

var _ = require("lodash");
var browserSync = require("browser-sync");
var browserify = require("browserify");
var buffer = require("vinyl-buffer");
var changed = require("gulp-changed");
var del = require("del");
var fs = require("fs");
var gulp = require("gulp");
var gutil = require("gulp-util");
var jshint = require("gulp-jshint");
var jshintStylish = require("jshint-stylish");
var karma = require("karma").server;
var merge = require("merge-stream");
var prettyTime = require("pretty-hrtime");
var rename = require("gulp-rename");
var replace = require("gulp-replace");
var shell = require("gulp-shell");
var source = require("vinyl-source-stream");
var sourcemaps = require("gulp-sourcemaps");
var uglify = require("gulp-uglify");
var watch = require("gulp-watch");
var watchify = require("watchify");

var BUILD_DIR = "build";
var BUILD_DIST_DIR = "build/dist";
var DIST_DIR = "dist";
var DEMO_SRC = "demo/**/*";
var DEMO_BUILD = BUILD_DIST_DIR + "/demo";

gulp.task("demo:build", function() {
    return gulp.src(DEMO_SRC)
        .pipe(replace("../" + BUILD_DIST_DIR + "/dagre-d3.js", "../dagre-d3.js"))
        .pipe(gulp.dest(DEMO_BUILD));
});

gulp.task("demo:watch", ["demo:build"], function() {
    gulp.src(DEMO_SRC)
        .pipe(watch(DEMO_SRC), { verbose: true })
        .pipe(changed(DEMO_BUILD))
        .pipe(replace("../" + BUILD_DIST_DIR + "/dagre-d3.js", "../dagre-d3.js"))
        .pipe(gulp.dest(DEMO_BUILD));
});

gulp.task("demo:test", ["demo:build"], function() {
    return gulp.src("test/demo-test.js")
        .pipe(shell("phantomjs <%= (file.path) %>"));
});

gulp.task("js:build", function() {
    return makeJsBundleTask(false);
});

gulp.task("js:watch", function() {
    return makeJsBundleTask(true);
});

gulp.task("js:test", ["js:build"], function(cb) {
    karmaSingleRun(__dirname + "/karma.conf.js", cb);
});

gulp.task("js:test:watch", ["js:build"], function(cb) {
    karma.start({
        configFile: __dirname + "/karma.conf.js",
        singleRun: false,
        browsers: ["PhantomJS"]
    });
    cb();
});

gulp.task("core-js:build", function() {
    return makeBundleTask("./index.js", "dagre-d3.core.js", false, {
        standalone: "dagreD3",
        bundleExternal: false,
        debug: true
    });
});

gulp.task("core-js:test", ["core-js:build"], function(cb) {
    karmaSingleRun(__dirname + "/karma.core.conf.js", cb);
});

gulp.task("version:build", function() {
    var pkg = readPackageJson();
    fs.writeFileSync("lib/version.js", generateVersionJs(pkg));
});

gulp.task("bower:build", function() {
    var pkg = readPackageJson();
    fs.writeFileSync("bower.json", generateBowerJson(pkg));
});

gulp.task("build", ["demo:build", "js:build", "js:test", "core-js:build", "core-js:test", "demo:test"]);

gulp.task("watch", ["demo:watch", "js:watch", "js:test:watch"]);

gulp.task("serve", ["watch"], function() {
    browserSync.init({
        files: BUILD_DIST_DIR + "/**/*",
        notify: false,
        open: false,
        reloadOnRestart: true,
        server: {
            baseDir: BUILD_DIST_DIR,
            directory: true
        }
    });
});

gulp.task("dist", ["version:build", "bower:build", "build"], function() {
    return gulp.src(BUILD_DIST_DIR + "/**/*")
        .pipe(gulp.dest(DIST_DIR));
});

gulp.task("release", ["dist"], function() {
    return gulp.src("src/release/release.sh")
        .pipe(shell("<%= (file.path) %>"));
});

gulp.task("clean", function(cb) {
    del(BUILD_DIR, cb);
});

gulp.task("default", ["build"]);

function karmaSingleRun(conf, cb) {
    var args = {
        configFile: conf,
        singleRun: true
    };

    if (process.env.BROWSERS) {
        args.browsers = process.env.BROWSERS.split(",");
    }

    karma.start(args, cb);
}

function makeJsBundleTask(watch) {
    return makeBundleTask("./index.js", "dagre-d3.js", watch, {
        standalone: "dagreD3",
        external: ["node_modules/d3/index.js", "node_modules/d3/d3.js"],
        debug: true
    });
}

function makeBundleTask(src, name, watch, args) {
    var bundler = browserify(_.defaults(args, watchify.args))
        .add(src);

    function bundle(changedFiles) {
        gutil.log("Starting '" + gutil.colors.cyan("browserify " + name) + "'...");
        var start = process.hrtime();
        var compileStream = bundler.bundle()
            .on("error", function(err) {
                gutil.log(gutil.colors.red("browserify error (" + name + "): " + err.message));
                this.emit("end");
            })
            .on("end", function() {
                var end = process.hrtime(start);
                gutil.log("Finished '" + gutil.colors.cyan("browserify " + name) + "' after",
                    gutil.colors.magenta(prettyTime(end)));
            })
            .pipe(source(name))
            .pipe(gulp.dest(BUILD_DIST_DIR))
            .pipe(buffer())
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(uglify({ preserveComments: "some" }))
            .pipe(rename({ suffix: ".min" }))
            .pipe(sourcemaps.write("./"))
            .pipe(gulp.dest(BUILD_DIST_DIR));

        var lintStream;
        if (changedFiles) {
            lintStream = gulp.src(changedFiles);
        } else {
            lintStream = gulp.src(["index.js", "lib/**/*.js"]);
        }

        lintStream = lintStream
            .pipe(jshint())
            .pipe(jshint.reporter(jshintStylish));
        if (!watch) {
            lintStream = lintStream.pipe(jshint.reporter("fail"));
        }

        return merge(lintStream, compileStream);
    }

    if (watch) {
        bundler = watchify(bundler);
        bundler.on("update", bundle);
    }

    return bundle();
}

function generateBowerJson(pkg) {
    return prettifyJson(applyTemplate("src/bower.json.tmpl", { pkg: pkg }));
}

function generateVersionJs(pkg) {
    return applyTemplate("src/version.js.tmpl", { pkg: pkg });
}

function applyTemplate(templateFile, props) {
    var template = fs.readFileSync(templateFile);
    var compiled = _.template(template);
    return compiled(props);
}

/**
 * Read the contents of package.json in as JSON. Do not cache package.json,
 * because it may have changed (e.g. when running in watch mode).
 */
function readPackageJson() {
    var packageText = fs.readFileSync("package.json");
    return JSON.parse(packageText);
}

/**
 * Given a JSON string return a prettified version of the string.
 */
function prettifyJson(str) {
    var json = JSON.parse(str);
    return JSON.stringify(json, null, 2);
}

NODE?=node
NPM?=npm
BROWSERIFY?=node_modules/browserify/bin/cmd.js
MOCHA?=node_modules/mocha/bin/mocha
MOCHA_OPTS?=
JS_COMPILER=node_modules/uglify-js/bin/uglifyjs
JS_COMPILER_OPTS?=--no-seqs

MODULE=dagre-d3

JS_SRC:=$(wildcard lib/*.js)

DEMO_SRC=$(wildcard demo/*)
DEMO_OUT=$(addprefix out/dist/, $(DEMO_SRC))

OUT_DIRS=out out/dist out/dist/demo

.PHONY: all release dist dist-demo test clean fullclean

all: dist test coverage

release: all
	src/release/release.sh $(MODULE) out/dist

dist: out/dist/$(MODULE).js out/dist/$(MODULE).min.js dist-demo

dist-demo: out/dist/demo $(DEMO_OUT)

test: test-demo

test-demo: test/demo-test.js out/dist/$(MODULE).min.js dist-demo $(wildcard demo/*)
	phantomjs $<

clean:
	rm -f lib/version.js
	rm -rf out

fullclean: clean
	rm -rf node_modules

$(OUT_DIRS):
	mkdir -p $@

out/dist/$(MODULE).js: browser.js Makefile out/dist node_modules lib/version.js $(JS_SRC)
	$(NODE) $(BROWSERIFY) $< > $@

out/dist/$(MODULE).min.js: out/dist/$(MODULE).js
	$(NODE) $(JS_COMPILER) $(JS_COMPILER_OPTS) $< > $@

out/dist/demo/%: demo/%
	@sed 's|\.\./out/dist/dagre-d3.min.js|../dagre-d3.min.js|' < $< > $@

lib/version.js: src/version.js package.json
	$(NODE) src/version.js > $@

node_modules: package.json
	$(NPM) install

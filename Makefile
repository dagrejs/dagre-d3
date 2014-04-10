# Binaries we use
NODE = node
NPM = npm

BROWSERIFY = ./node_modules/browserify/bin/cmd.js
JSHINT = ./node_modules/jshint/bin/jshint
MOCHA = ./node_modules/mocha/bin/_mocha
PHANTOMJS = ./node_modules/phantomjs/bin/phantomjs
UGLIFY = ./node_modules/uglify-js/bin/uglifyjs

# Module def
MODULE = dagre-d3
MODULE_JS = $(MODULE).js
MODULE_MIN_JS = $(MODULE).min.js

# Various files
SRC_FILES = index.js lib/version.js $(shell find lib -type f -name '*.js')

DEMO_FILES = $(wildcard demo/*)
DEMO_BUILD_FILES = $(addprefix build/, $(DEMO_FILES))

TEST_COV = build/coverage

# Targets
.PHONY: all test demo-test lint release clean fullclean

.DELETE_ON_ERROR:

all: build test

lib/version.js: package.json
	$(NODE) src/version.js > $@

build: build/$(MODULE_JS) build/$(MODULE_MIN_JS) build/demo

build/demo: $(DEMO_BUILD_FILES)

build/demo/%: demo/%
	mkdir -p $(@D)
	sed 's|\.\./build/dagre-d3.js|../dagre-d3.js|' < $< > $@ 

build/$(MODULE_JS): browser.js node_modules $(SRC_FILES)
	mkdir -p $(@D)
	$(BROWSERIFY) $(BROWSERIFY_OPTS) -x node_modules/d3/index-browserify.js $< > $@

build/$(MODULE_MIN_JS): build/$(MODULE_JS)
	$(UGLIFY) $(UGLIFY_OPTS) $< > $@

dist: build/$(MODULE_JS) build/$(MODULE_MIN_JS) build/demo | test
	rm -rf $@
	mkdir -p $@
	cp -r $^ dist

test: build demo-test lint

demo-test: test/demo-test.js $(SRC_FILES) node_modules
	$(PHANTOMJS) $<

lint: build/lint

build/lint: browser.js $(SRC_FILES) $(TEST_FILES)
	mkdir -p $(@D)
	$(JSHINT) $?
	touch $@
	@echo

release: dist
	src/release/release.sh $(MODULE) dist

clean:
	rm -rf build dist

fullclean: clean
	rm -rf ./node_modules
	rm -f lib/version.js

node_modules: package.json
	$(NPM) install
	touch node_modules

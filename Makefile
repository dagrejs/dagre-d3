MOD = dagre-d3

NPM = npm
BROWSERIFY = ./node_modules/browserify/bin/cmd.js
ISTANBUL = ./node_modules/istanbul/lib/cli.js
JSCS = ./node_modules/jscs/bin/jscs
JSHINT = ./node_modules/jshint/bin/jshint
KARMA = ./node_modules/karma/bin/karma
MOCHA = ./node_modules/mocha/bin/_mocha
UGLIFY = ./node_modules/uglify-js/bin/uglifyjs

JSHINT_OPTS = --reporter node_modules/jshint-stylish/stylish.js

BUILD_DIR = build
COVERAGE_DIR = $(BUILD_DIR)/cov

SRC_FILES = index.js lib/version.js $(shell find lib -type f -name '*.js')
DEMO_FILES = $(wildcard demo/*)
DEMO_BUILD_FILES = $(addprefix build/, $(DEMO_FILES))

DIRS = $(BUILD_DIR)

# Targets
.PHONY: all test karma unit-test demo-test lint release clean

.DELETE_ON_ERROR:

all: dist

lib/version.js: package.json src/release/make-version.js
	src/release/make-version.js > $@

$(DIRS):
	@mkdir -p $@

$(BUILD_DIR)/demo: $(DEMO_BUILD_FILES) $(BUILD_DIR)

$(BUILD_DIR)/demo/%: demo/%
	@mkdir -p $(@D)
	sed 's|\.\./build/dagre-d3.js|../dagre-d3.js|' < $< > $@ 

$(BUILD_DIR)/bower.json: package.json src/release/make-bower.json.js $(BUILD_DIR)
	src/release/make-bower.json.js > $@

$(BUILD_DIR)/$(MOD).js: browser.js node_modules $(SRC_FILES) $(BUILD_DIR)
	$(BROWSERIFY) $(BROWSERIFY_OPTS) -x node_modules/d3/index-browserify.js $< > $@

$(BUILD_DIR)/$(MOD).min.js: build/$(MOD).js $(BUILD_DIR)
	$(UGLIFY) $(UGLIFY_OPTS) $< > $@

dist: $(BUILD_DIR)/$(MOD).js $(BUILD_DIR)/$(MOD).min.js $(BUILD_DIR)/demo $(BUILD_DIR)/bower.json | test
	rm -rf $@
	mkdir -p $@
	cp -r $^ dist

karma:
	$(KARMA) start

test: build unit-test demo-test lint

unit-test: $(BUILD_DIR)/$(MOD).js
	$(KARMA) start --single-run --browsers Firefox

lint: browser.js $(SRC_FILES) $(TEST_FILES)
	@$(JSHINT) $(JSHINT_OPTS) $?
	@$(JSCS) $?

release: dist
	src/release/release.sh $(MODULE) dist

clean:
	rm -rf build dist

node_modules: package.json
	$(NPM) install
	touch node_modules

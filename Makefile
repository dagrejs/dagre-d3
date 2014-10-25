MOD = dagre-d3

NPM = npm
BROWSERIFY = ./node_modules/browserify/bin/cmd.js
ISTANBUL = ./node_modules/istanbul/lib/cli.js
JSHINT = ./node_modules/jshint/bin/jshint
JSCS = ./node_modules/jscs/bin/jscs
KARMA = ./node_modules/karma/bin/karma
MOCHA = ./node_modules/mocha/bin/_mocha
PHANTOMJS = ./node_modules/phantomjs/bin/phantomjs
UGLIFY = ./node_modules/uglify-js/bin/uglifyjs

JSHINT_OPTS = --reporter node_modules/jshint-stylish/stylish.js

BUILD_DIR = build
COVERAGE_DIR = $(BUILD_DIR)/cov
DIST_DIR = dist

SRC_FILES = index.js lib/version.js $(shell find lib -type f -name '*.js')
TEST_FILES = $(shell find test -type f -name '*.js' | grep -v 'bundle-test.js' | grep -v 'demo-test.js')
DEMO_FILES = $(wildcard demo/*)
DEMO_BUILD_FILES = $(addprefix build/, $(DEMO_FILES))
BUILD_FILES = $(addprefix $(BUILD_DIR)/, \
						$(MOD).js $(MOD).min.js \
						$(MOD).core.js $(MOD).core.min.js)

DIRS = $(BUILD_DIR)

.PHONY: all clean lint browser-test demo-test test dist

all: dist

lib/version.js: package.json src/release/make-version.js
	src/release/make-version.js > $@

$(DIRS):
	@mkdir -p $@

test: lint browser-test demo-test

lint: index.js $(SRC_FILES) $(TEST_FILES)
	@$(JSHINT) $(JSHINT_OPTS) $?
	@$(JSCS) $?

browser-test: $(BUILD_DIR)/$(MOD).js $(BUILD_DIR)/$(MOD).core.js
	$(KARMA) start --single-run $(KARMA_OPTS)
	$(KARMA) start karma.core.conf.js --single-run $(KARMA_OPTS)

demo-test: test/demo-test.js $(SRC_FILES) node_modules
	#$(PHANTOMJS) $<

bower.json: package.json src/release/make-bower.json.js
	src/release/make-bower.json.js > $@

$(BUILD_DIR)/$(MOD).js: index.js $(SRC_FILES) $(BUILD_DIR) | lint
	$(BROWSERIFY) $(BROWSERIFY_OPTS) $< > $@ \
		-x node_modules/d3/index.js \
		-x node_modules/d3/d3.js \
		-s dagreD3

$(BUILD_DIR)/$(MOD).min.js: $(BUILD_DIR)/$(MOD).js
	@$(UGLIFY) $< --comments '@license' > $@

$(BUILD_DIR)/$(MOD).core.js: index.js $(SRC_FILES) $(BUILD_DIR) | lint
	@$(BROWSERIFY) $< > $@ --no-bundle-external \
		-s dagreD3

$(BUILD_DIR)/$(MOD).core.min.js: $(BUILD_DIR)/$(MOD).core.js
	@$(UGLIFY) $< --comments '@license' > $@

$(BUILD_DIR)/demo: $(DEMO_BUILD_FILES) $(BUILD_DIR)

$(BUILD_DIR)/demo/%: demo/%
	@mkdir -p $(@D)
	sed 's|\.\./build/dagre-d3.js|../dagre-d3.js|' < $< > $@

dist: $(BUILD_FILES) $(BUILD_DIR)/demo | bower.json test
	@rm -rf $@
	@mkdir -p $@
	@cp -r $^ dist

release: dist
	@echo
	@echo Starting release...
	@echo
	@src/release/release.sh $(MOD) dist

clean:
	rm -rf $(BUILD_DIR)

node_modules: package.json
	@$(NPM) install
	@touch $@

MOD = dagre-d3

NODE = node
NPM = npm
BROWSERIFY = ./node_modules/browserify/bin/cmd.js
ISTANBUL = ./node_modules/istanbul/lib/cli.js
JSHINT = ./node_modules/jshint/bin/jshint
JSCS = ./node_modules/jscs/bin/jscs
KARMA = ./node_modules/karma/bin/karma
MOCHA = ./node_modules/mocha/bin/_mocha
PHANTOMJS = ./node_modules/phantomjs-prebuilt/bin/phantomjs
UGLIFY = ./node_modules/uglify-js/bin/uglifyjs

ISTANBUL_OPTS = --dir $(COVERAGE_DIR) --report html
JSHINT_OPTS = --reporter node_modules/jshint-stylish/stylish.js
MOCHA_OPTS = -R dot

BUILD_DIR = build
COVERAGE_DIR = $(BUILD_DIR)/cov
DIST_DIR = dist

DEMO_FILES = $(shell find demo -type f)
SRC_FILES = index.js lib/version.js $(shell find lib -type f -name '*.js')
BUILD_FILES = $(addprefix $(BUILD_DIR)/dist/, \
		$(MOD).js $(MOD).min.js \
		$(MOD).core.js $(MOD).core.min.js \
		$(DEMO_FILES))

DIRS = $(BUILD_DIR) $(BUILD_DIR)/dist $(BUILD_DIR)/dist/demo

.PHONY: all clean browser-test demo-test test dist

all: test

lib/version.js: package.json
	@src/release/make-version.js > $@

$(DIRS):
	@mkdir -p $@

test: browser-test demo-test node-test

browser-test: $(BUILD_FILES)
	$(KARMA) start --single-run $(KARMA_OPTS)
	$(KARMA) start karma.core.conf.js --single-run $(KARMA_OPTS)

demo-test: test/demo-test.js | $(BUILD_FILES)
	$(PHANTOMJS) $<

node-test: test/node-test.js | $(BUILD_FILES)
	$(NODE) $<

bower.json: package.json src/release/make-bower.json.js
	@src/release/make-bower.json.js > $@

$(BUILD_DIR)/dist/$(MOD).js: index.js $(SRC_FILES) | $(BUILD_DIR)/dist node_modules
	@$(BROWSERIFY) $< > $@ -s dagreD3

$(BUILD_DIR)/dist/$(MOD).min.js: $(BUILD_DIR)/dist/$(MOD).js | $(BUILD_DIR)/dist
	@$(UGLIFY) $< --comments '@license' --source-map --output $@

$(BUILD_DIR)/dist/$(MOD).core.js: index.js $(SRC_FILES) | $(BUILD_DIR)/dist node_modules
	@$(BROWSERIFY) $< > $@ --no-bundle-external -s dagreD3

$(BUILD_DIR)/dist/$(MOD).core.min.js: $(BUILD_DIR)/dist/$(MOD).core.js | $(BUILD_DIR)/dist
	@$(UGLIFY) $< --comments '@license' --source-map --output $@

$(BUILD_DIR)/dist/demo/%: demo/% | $(BUILD_DIR)/dist/demo
	@cp $< $@

dist: $(BUILD_FILES) bower.json test
	@rm -rf $@
	@mkdir -p $@
	@cp -r $(BUILD_DIR)/dist/* $@

release: dist
	@echo
	@echo Starting release...
	@echo
	@src/release/release.sh $(MOD) dist

clean:
	rm -rf $(BUILD_DIR)
	rm -rf $(DIST_DIR)/demo

node_modules: package.json
	@$(NPM) install
	@touch $@

# Binaries we use
NPM = npm
BROWSERIFY = ./node_modules/browserify/bin/cmd.js
JSCS = ./node_modules/jscs/bin/jscs
JSHINT = ./node_modules/jshint/bin/jshint
MOCHA = ./node_modules/mocha/bin/_mocha
MOCHA_PHANTOMJS = ./node_modules/mocha-phantomjs/bin/mocha-phantomjs
PHANTOMJS = ./node_modules/phantomjs/bin/phantomjs
UGLIFY = ./node_modules/uglify-js/bin/uglifyjs

JSHINT_OPTS = --reporter node_modules/jshint-stylish/stylish.js

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
.PHONY: all test mocha-test demo-test lint release clean

.DELETE_ON_ERROR:

all: build test

lib/version.js: package.json src/release/make-version.js
	src/release/make-version.js > $@

build: build/$(MODULE_JS) build/$(MODULE_MIN_JS) build/bower.json build/demo

build/demo: $(DEMO_BUILD_FILES)

build/demo/%: demo/%
	@mkdir -p $(@D)
	sed 's|\.\./build/dagre-d3.js|../dagre-d3.js|' < $< > $@ 

build/bower.json: package.json src/release/make-bower.json.js
	src/release/make-bower.json.js > $@

build/$(MODULE_JS): browser.js node_modules $(SRC_FILES)
	@mkdir -p $(@D)
	$(BROWSERIFY) $(BROWSERIFY_OPTS) -x node_modules/d3/index-browserify.js $< > $@

build/$(MODULE_MIN_JS): build/$(MODULE_JS)
	$(UGLIFY) $(UGLIFY_OPTS) $< > $@

dist: build/$(MODULE_JS) build/$(MODULE_MIN_JS) build/demo build/bower.json | test
	rm -rf $@
	mkdir -p $@
	cp -r $^ dist

test: build mocha-test demo-test lint

mocha-test: test/index.html
	$(MOCHA_PHANTOMJS) $?

demo-test: test/demo-test.js $(SRC_FILES) node_modules
	$(PHANTOMJS) $<

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

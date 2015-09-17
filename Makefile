BROWSERIFY:=node_modules/.bin/browserify
bundle.js: main.js
	$(BROWSERIFY) $^ >"$@"


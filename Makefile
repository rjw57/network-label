BROWSERIFY:=node_modules/.bin/browserify

copies:=$(patsubst app/%,dist/%,$(wildcard app/*))

all: dist/index.html dist/style.css dist/bundle.js
.PHONY: all

dist/bundle.js: app/main.js
	$(BROWSERIFY) $^ >"$@"

$(copies): dist/%: app/%
	cp "$<" "$@"


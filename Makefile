VERSION := $(shell grep "\"version" package.json | cut -d ":" -f 2 | tr -d ' ",')

dev-web:
	esbuild src/web/index.js --bundle --outfile=index.min.js --watch
dev-cli:
	esbuild src/cli/js-syntax.js --bundle --outfile=js-syntax.js --watch \
		--platform=neutral --main-fields=main,module "--external:tjs:*"
build-web:
	esbuild src/web/index.js --bundle --outfile=index.min.js --minify
build-cli:
	esbuild src/cli/js-syntax.js --bundle --outfile=js-syntax.bundle.js --minify \
		--platform=neutral --main-fields=main,module "--external:tjs:*"
	@echo "\n// version $(VERSION)" >> ./js-syntax.bundle.js;
run-file:
	tjs run ./js-syntax.js src/lib/code.txt
run-url:
	tjs run ./js-syntax.js https://unpkg.com/js-syntax-detector@1.0.0/src/lib/code.txt
build: build-web build-cli
	@echo "Build completed successfully."
compile-bin-linux:
	mkdir -p bin/linux
	tjs compile js-syntax.bundle.js bin/linux/js-syntax
compile-bin-darwin:
	mkdir -p bin/darwin
	tjs compile js-syntax.bundle.js bin/darwin/js-syntax
compile-bin: compile-bin-darwin
	@echo "Binary compilation completed successfully."
compile: build-cli compile-bin
	@echo "Compilation completed successfully."
publish:
	npm publish --registry=https://registry.npmjs.com/ --access public
	@echo "Published to npm successfully."

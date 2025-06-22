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
run-file:
	tjs run ./js-syntax.js src/lib/code.txt
run-url:
	tjs run ./js-syntax.js https://unpkg.com/js-syntax-detector@1.0.0/src/lib/code.txt
build: build-web build-cli
	@echo "Build completed successfully."
compile-bin:
	tjs compile js-syntax.bundle.js bin/macos/js-syntax
compile: build-cli compile-bin
	@echo "Compilation completed successfully."

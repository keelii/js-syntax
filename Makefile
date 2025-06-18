dev-web:
	esbuild src/web/index.js --bundle --outfile=index.min.js --watch
build-web:
	esbuild src/web/index.js --bundle --outfile=index.min.js --minify
dev-cli:
	esbuild src/cli/js-syntax.js --bundle --outfile=js-syntax.js --watch \
		--platform=neutral --main-fields=main,module "--external:tjs:*"
run-file:
	tjs run ./js-syntax.js src/lib/code.txt
run-url:
	tjs run ./js-syntax.js https://unpkg.com/js-syntax-detector@1.0.0/src/lib/code.txt
compile:
	tjs compile js-syntax.js bin/js-syntax

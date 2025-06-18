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
	tjs run ./js-syntax.js https://unpkg.com/vue-router@4.5.1/dist/vue-router.global.js
compile:
	tjs compile js-syntax.js bin/js-syntax

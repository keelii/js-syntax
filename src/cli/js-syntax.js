import getopts from "tjs:getopts";
import {decodeText, isURL, readStdin} from "./utils.js";
import packageJson from "../../package.json" with { type: "json" };
import {doUpgrade} from "./upgrade";
import {detectText} from "./detector";


var opts = getopts(tjs.args, {
    alias: {
        u: "upgrade",
        h: "help",
        V: "version",
        v: "verbose",
    }
})

var document = `Usage: js-syntax [options] <file|url>
  -u, --upgrade            Do upgrading js-syntax itself
  -h, --help               Show this help message and exit
  -v, --verbose            Show detailed information
  -V, --version            Show version number and exit
Example:
  js-syntax --upgrade
  js-syntax https://example.com/script.js
  js-syntax /path/to/local/script.js`;

if (opts.V) {
    console.log(opts)
}

if (opts._.includes("tjs") && opts._.includes("run")) {
    opts._ = opts._.slice(3);
} else {
    opts._ = opts._.slice(1);
}

var args = opts._
if (opts.h) {
    console.log(document)
    tjs.exit(0)
}
if (opts.v) {
    console.log(packageJson.version)
    tjs.exit(0)
}
if (opts.u) {
    if (tjs.system.platform === "windows") {
        console.error("[✘] Error: Upgrading js-syntax is not supported on Windows platform.");
        tjs.exit(1);
    } else {
        await doUpgrade(packageJson.version)
        tjs.exit(0)
    }
}

if (args.length < 1) {
    if (tjs.stdin.type === "pipe") {
        var text = await readStdin()
        var res = detectText(text, { file: "stdin", opts })
        if (res) {
            console.log(`[⚠] Found ${res} newer syntax(ES6+) in stdin.`);
            tjs.exit(1);
        } else {
            console.log("[✓] No newer syntax in stdin.");
            tjs.exit(0);
        }
    } else {
        console.log(document)
    }
}

let newerSyntaxCount = 0
for (const arg of args) {
    try {
        if (opts.V) {
            console.log("[➤] Get file:", arg);
        }
        if (isURL(arg)) {
            var response = await fetch(arg)
            var text = await response.text()
            if (text.trim() === "") {
                console.error("[✘] Error: The URL returned an empty response.");
                tjs.exit(1);
            }
            var yes = detectText(text, { file: arg, opts });
            if (yes) newerSyntaxCount += yes
        } else {
            var res = await tjs.readFile(arg)
            var text = decodeText(res)
            if (text.trim() === "") {
                console.error("[✘] Error: The file content empty.");
                tjs.exit(1);
            }
            var yes = detectText(text, { file: arg, opts });
            if (yes) newerSyntaxCount += yes
        }
    } catch (e) {
        console.error("[✘] Error reading file or URL:", e);
        tjs.exit(1);
    }
}

// console.log(newerSyntaxCount)
if (newerSyntaxCount > 1) {
    console.log(`[⚠] Found ${newerSyntaxCount} newer syntax(ES6+) in the files.`);
    tjs.exit(1);
}
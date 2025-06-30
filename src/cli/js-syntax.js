import path from "tjs:path";
import getopts from "tjs:getopts";
import {detect} from "../lib/detect.js";
import {decodeText, isURL, readStdin} from "./utils.js";
import packageJson from "../../package.json" with { type: "json" };

var opts = getopts(tjs.args, {
    alias: {
        h: "help",
        v: "version"
    }
})

var document = `Usage: js-syntax [options] <file|url>
  -h, --help               Show this help message and exit
  -v, --version            Show version number and exit
Example:
  js-syntax https://example.com/script.js
  js-syntax /path/to/local/script.js`;

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

var text = ""
var file = ""

if (args.length < 1) {
    if (tjs.stdin.type === "pipe") {
        file = "stdin"
        text = await readStdin()
    } else {
        console.log(document)
    }
}

if (!text) {
    try {
        if (isURL(args[0])) {
            var response = await fetch(args[0])
            text = await response.text()
            if (text.trim() === "") {
                console.error("Error: The URL returned an empty response.");
                tjs.exit(1);
            }
            file = args[0]
        } else {
            var res = await tjs.readFile(args[0])
            text = decodeText(res)
            file = path.resolve(args[0])
        }
    } catch (e) {
        console.error("Error reading file or URL:", e);
        tjs.exit(1);
    }
}

var ret = detect(text)
for (let key in ret) {
    var item = ret[key]
    for (let i = 0; i < item.locations.length; i++) {
        console.log(`[${key}] ${file}:${item.locations[i].start.line}:${item.locations[i].start.column}`);
    }
}

if (Object.values(ret).flat().length < 1) {
    console.log("No newer syntax(ES6+) syntax found.")
}

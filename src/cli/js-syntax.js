import path from "tjs:path";
import {detect} from "../lib/detect.js";
import {decodeText, isURL} from "./utils.js";


var document = `Usage: js-syntax <file|url>
Example:
  js-syntax https://example.com/script.js
  js-syntax /path/to/local/script.js`;

var args = tjs.args.slice(1);
if (args.length < 1) {
    console.log(document)
    tjs.exit(1)
}

var text = ""
var file = ""

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

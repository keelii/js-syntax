import {detect} from "../lib/detect";

export function detectText(text, { file, opts }) {
    var ret = detect(text)

    if (!ret) return -1

    if (opts.V) {
        console.log(`[➤] Detected syntax(${text.length}):\n`, text.slice(0, 77) + (text.length > 77 ? "..." : ""));
    }

    for (let key in ret) {
        var item = ret[key]
        for (let i = 0; i < item.locations.length; i++) {
            console.log(`[!] <${key}> ${file}:${item.locations[i].start.line}:${item.locations[i].start.column}`);
        }
    }

    var results = Object.values(ret).flat()
    if (results.length < 1) {
        console.log("[✓] No newer syntax in", file);
        return 0
    } else {
        return results.length
    }
}

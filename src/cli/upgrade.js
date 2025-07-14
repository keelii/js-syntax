import {semver_compare} from "../lib/semver_compare";
import {parse} from "../lib/semver_parse";
import {arrayBufferToFile} from "../lib/stream";
import {delay} from "../lib/delay";
import {encodeText} from "./utils";

export function greaterThan(version1, version2) {
    return semver_compare(parse(version1), parse(version2)) > 0;
}
function findFileSize(info, path) {
    const file = info.files.find(f => f.path === path);
    if (file) {
        return (file.size / 1024 / 1024).toPrecision(2)
    } else {
        return 0
    }
}
export async function getLatestVersion() {
    try {
        const response = await fetch("https://unpkg.com/js-syntax-detector/?meta")
        return await response.json()
    } catch (e) {
        console.warn(e)
        return null
    }
}

export function spinnerLoading(interval = 100) {
    const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let timer;
    let i = 0;
    return {
        start: () => {
            timer = setInterval(async () => {
                await tjs.stdout.write(encodeText(`\r${spinnerFrames[i++ % spinnerFrames.length]}`));
            }, interval);
            return timer;
        },
        stop: () => {
            i = 0;
            tjs.stdout.write(encodeText("\rdone ✓\n"));
            clearInterval(timer);
        },
    }
}

export async function doUpgrade(version) {
    const latestPackageInfo = await getLatestVersion()

    if (greaterThan(latestPackageInfo.version, version)) {
        console.log(`Upgrading js-syntax from version ${version} to ${latestPackageInfo.version}...`)
        if (!tjs.exePath.endsWith('js-syntax')) {
            console.log(`something is wrong, tjs.exePath(${tjs.exePath}) is not js-syntax`)
            return
        }
        const filePath = `/bin/${tjs.system.platform}/js-syntax`
        const url = `https://unpkg.com/js-syntax-detector@${latestPackageInfo.version}${filePath}`
        const size = findFileSize(latestPackageInfo, filePath)
        console.log(`Downloading binary(${size}MB) from:`, url)
        const spinner = spinnerLoading()
        spinner.start()
        const response = await fetch(url)
        spinner.stop()
        const b = await response.arrayBuffer()
        await arrayBufferToFile(b, tjs.exePath)
        console.log("Upgraded to version:", latestPackageInfo.version)
    } else {
        console.log(`js-syntax is already at the latest version: ${version}`)
    }
}
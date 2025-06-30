
const encoder = new TextEncoder()
const decoder = new TextDecoder()

export function decodeText(u8) {
    return decoder.decode(u8)
}
export function encodeText(str) {
    return encoder.encode(str)
}

export async function readStdin() {
    const c = new Uint8Array(1);
    const buf = [];

    while (true) {
        const n = await tjs.stdin.read(c);

        // EOF
        if (n === null) {
            break;
        }

        if (n === 0) {
            break;
        }

        buf.push(c[0]);
    }

    return decoder.decode(new Uint8Array(buf));
}

export function isURL(str) {
    try {
        new URL(str);
        return true;
    } catch (e) {
        return false;
    }
}
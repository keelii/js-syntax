export async function arrayBufferToFile(buf, filename) {
    try {
        const writer = await tjs.open(filename, 'w');
        await writer.write(new Uint8Array(buf));
    } catch (e) {
        console.error(e);
    }
}
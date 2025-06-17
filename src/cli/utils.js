export function decodeText(u8) {
    return new TextDecoder().decode(u8)
}
export function isURL(str) {
    try {
        new URL(str);
        return true;
    } catch (e) {
        return false;
    }
}
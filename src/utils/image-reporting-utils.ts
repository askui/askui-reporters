export function convertPngDataUrlToBuffer(pngDataUrl: string): Buffer {
    const base64Data = pngDataUrl.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    return buffer;
}
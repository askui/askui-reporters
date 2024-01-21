export function convertPngDataUrlToBuffer(pngDataUrl: string): Buffer {
    const base64Data = convertPngDataUrlToBase64(pngDataUrl);
    const buffer = Buffer.from(base64Data, "base64");
    return buffer;
}

export function convertPngDataUrlToBase64(pngDataUrl: string): string {
    const base64Data = pngDataUrl.replace(/^data:image\/png;base64,/, "");
    return base64Data;
}

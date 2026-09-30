const MAX_UPLOAD_DIMENSION = 1536;
const UPLOAD_JPEG_QUALITY = 0.9;

export async function downscaleImage(file: File): Promise<string> {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_UPLOAD_DIMENSION / Math.max(bitmap.width, bitmap.height));

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('Could not process the image');
    }
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    return canvas.toDataURL('image/jpeg', UPLOAD_JPEG_QUALITY);
}

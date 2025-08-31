/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

interface ThumbnailData {
    url: string;
    aspectRatio: '16:9' | '9:16';
    title: string;
}

// Helper function to load an image and return it as an HTMLImageElement
function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(new Error(`Failed to load image: ${src.substring(0, 50)}...`));
        img.src = src;
    });
}

/**
 * Creates a single "photo album" page from a collection of generated thumbnails.
 * @param thumbnails An array of thumbnail data objects.
 * @returns A promise that resolves to a data URL of the generated album page (JPEG format).
 */
export async function createThumbnailAlbumPage(thumbnails: ThumbnailData[]): Promise<string> {
    const canvas = document.createElement('canvas');
    const canvasWidth = 3300;
    const canvasHeight = 2550; // Landscape A4-like ratio
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Could not get 2D canvas context');
    }

    // 1. Draw the album page background
    ctx.fillStyle = '#1a1a1a'; // A dark background
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 2. Draw the title
    ctx.fillStyle = '#f0f0f0';
    ctx.textAlign = 'center';

    ctx.font = `bold 90px 'Caveat', cursive`;
    ctx.fillText('AI Thumbnail Generator', canvasWidth / 2, 150);

    ctx.font = `45px 'Roboto', sans-serif`;
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText('Generated with Google AI', canvasWidth / 2, 220);

    // 3. Separate thumbnails by aspect ratio and load images
    const landscapeThumbs = thumbnails.filter(t => t.aspectRatio === '16:9');
    const portraitThumbs = thumbnails.filter(t => t.aspectRatio === '9:16');
    
    const allImageData = [...landscapeThumbs, ...portraitThumbs];
    const loadedImages = await Promise.all(allImageData.map(thumb => loadImage(thumb.url)));
    
    const loadedThumbnails = allImageData.map((thumb, index) => ({
        ...thumb,
        img: loadedImages[index],
    }));

    // 4. Define layout and draw images
    const PADDING = 150;
    const HEADER_HEIGHT = 300;
    const CONTENT_WIDTH = canvasWidth - 2 * PADDING;
    const CONTENT_HEIGHT = canvasHeight - HEADER_HEIGHT - PADDING;
    const ROW_GAP = 100;
    const ROW_HEIGHT = (CONTENT_HEIGHT - ROW_GAP) / 2;

    // --- Draw Landscape Thumbnails ---
    if (landscapeThumbs.length > 0) {
        const totalImageWidth = CONTENT_WIDTH * 0.9; // Use 90% of content width
        const imageWidth = totalImageWidth / landscapeThumbs.length;
        const imageHeight = imageWidth * (9 / 16);
        const startX = (canvasWidth - totalImageWidth) / 2;
        const y = HEADER_HEIGHT + (ROW_HEIGHT - imageHeight) / 2;
        
        loadedThumbnails
            .filter(t => t.aspectRatio === '16:9')
            .forEach(({ img }, index) => {
                const x = startX + index * imageWidth;
                drawRotatedImage(ctx, img, x, y, imageWidth, imageHeight);
            });
    }

    // --- Draw Portrait Thumbnails ---
    if (portraitThumbs.length > 0) {
        const totalImageWidth = CONTENT_WIDTH * 0.8; // Use 80% of content width for vertical images
        const imageHeight = ROW_HEIGHT * 0.9;
        const imageWidth = imageHeight * (9 / 16);
        const effectiveTotalWidth = imageWidth * portraitThumbs.length;
        const startX = (canvasWidth - effectiveTotalWidth) / 2;
        const y = HEADER_HEIGHT + ROW_HEIGHT + ROW_GAP + (ROW_HEIGHT - imageHeight) / 2;

        loadedThumbnails
            .filter(t => t.aspectRatio === '9:16')
            .forEach(({ img }, index) => {
                const x = startX + index * imageWidth;
                drawRotatedImage(ctx, img, x, y, imageWidth, imageHeight);
            });
    }


    // Convert canvas to a high-quality JPEG and return the data URL
    return canvas.toDataURL('image/jpeg', 0.92);
}

function drawRotatedImage(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number
) {
    ctx.save();

    // Translate context to the center of the image for rotation
    ctx.translate(x + w / 2, y + h / 2);
    
    // Apply a slight, random rotation for a hand-placed look
    const rotation = (Math.random() - 0.5) * 0.08; // Radians (approx. +/- 2.3 degrees)
    ctx.rotate(rotation);

    // Draw a soft shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetX = 10;
    ctx.shadowOffsetY = 10;

    // Draw a white border
    const BORDER = 15;
    ctx.fillStyle = '#fff';
    ctx.fillRect(-w / 2 - BORDER, -h / 2 - BORDER, w + BORDER * 2, h + BORDER * 2);
    
    // Draw the image itself (centered at the new origin)
    ctx.shadowColor = 'transparent'; // No shadow for the image itself
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    
    ctx.restore(); // Restore context to pre-transformation state
}
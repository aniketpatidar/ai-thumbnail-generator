




interface ThumbnailData {
    url: string;
    aspectRatio: '16:9' | '9:16';
    title: string;
}


function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(new Error(`Failed to load image: ${src.substring(0, 50)}...`));
        img.src = src;
    });
}






export async function createThumbnailAlbumPage(thumbnails: ThumbnailData[]): Promise<string> {
    const canvas = document.createElement('canvas');
    const canvasWidth = 3300;
    const canvasHeight = 2550; 
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Could not get 2D canvas context');
    }

    
    ctx.fillStyle = '#1a1a1a'; 
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    
    ctx.fillStyle = '#f0f0f0';
    ctx.textAlign = 'center';

    ctx.font = `bold 90px 'Caveat', cursive`;
    ctx.fillText('AI Thumbnail Generator', canvasWidth / 2, 150);

    ctx.font = `45px 'Roboto', sans-serif`;
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText('Generated with Google AI', canvasWidth / 2, 220);

    
    const landscapeThumbs = thumbnails.filter(t => t.aspectRatio === '16:9');
    const portraitThumbs = thumbnails.filter(t => t.aspectRatio === '9:16');
    
    const allImageData = [...landscapeThumbs, ...portraitThumbs];
    const loadedImages = await Promise.all(allImageData.map(thumb => loadImage(thumb.url)));
    
    const loadedThumbnails = allImageData.map((thumb, index) => ({
        ...thumb,
        img: loadedImages[index],
    }));

    
    const PADDING = 150;
    const HEADER_HEIGHT = 300;
    const CONTENT_WIDTH = canvasWidth - 2 * PADDING;
    const CONTENT_HEIGHT = canvasHeight - HEADER_HEIGHT - PADDING;
    const ROW_GAP = 100;
    const ROW_HEIGHT = (CONTENT_HEIGHT - ROW_GAP) / 2;

    
    if (landscapeThumbs.length > 0) {
        const totalImageWidth = CONTENT_WIDTH * 0.9; 
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

    
    if (portraitThumbs.length > 0) {
        const totalImageWidth = CONTENT_WIDTH * 0.8; 
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

    
    ctx.translate(x + w / 2, y + h / 2);
    
    
    const rotation = (Math.random() - 0.5) * 0.08; 
    ctx.rotate(rotation);

    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetX = 10;
    ctx.shadowOffsetY = 10;

    
    const BORDER = 15;
    ctx.fillStyle = '#fff';
    ctx.fillRect(-w / 2 - BORDER, -h / 2 - BORDER, w + BORDER * 2, h + BORDER * 2);
    
    
    ctx.shadowColor = 'transparent'; 
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    
    ctx.restore(); 
}








export async function copyImageToClipboard(imageUrl: string): Promise<boolean> {
    try {
        
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        
        const clipboardItem = new ClipboardItem({
            [blob.type]: blob
        });

        
        await navigator.clipboard.write([clipboardItem]);
        return true;
    } catch (error) {
        console.error('Failed to copy image to clipboard:', error);
        return false;
    }
}




export async function copyTextToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy text to clipboard:', error);
        
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            return successful;
        } catch (fallbackError) {
            console.error('Fallback clipboard copy also failed:', fallbackError);
            return false;
        }
    }
}




export async function downloadImage(imageUrl: string, filename: string): Promise<void> {
    try {
        
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        
        const aspectRatio = filename.includes('16:9') ? '16:9' : '9:16';
        
        
        if (aspectRatio === '16:9') {
            canvas.width = 1280;  
            canvas.height = 720;   
        } else { 
            canvas.width = 720;    
            canvas.height = 1280;   
        }
        
        
        await new Promise<void>((resolve, reject) => {
            img.onload = () => {
                try {
                    
                    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = imageUrl;
        });
        
        
        canvas.toBlob((blob) => {
            if (!blob) {
                throw new Error('Canvas to Blob conversion failed');
            }
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 'image/jpeg', 0.95);
    } catch (error) {
        console.error('Error processing image for download:', error);
        
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}




export function isClipboardSupported(): boolean {
    return 'clipboard' in navigator && 'write' in navigator.clipboard;
}




export async function checkClipboardPermission(): Promise<boolean> {
    if (!isClipboardSupported()) {
        return false;
    }

    try {
        
        await navigator.clipboard.readText();
        return true;
    } catch (error) {
        return false;
    }
}

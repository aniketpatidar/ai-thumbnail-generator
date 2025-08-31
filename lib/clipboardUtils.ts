/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * Copy an image to clipboard
 */
export async function copyImageToClipboard(imageUrl: string): Promise<boolean> {
    try {
        // Fetch the image
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        // Create a ClipboardItem
        const clipboardItem = new ClipboardItem({
            [blob.type]: blob
        });

        // Write to clipboard
        await navigator.clipboard.write([clipboardItem]);
        return true;
    } catch (error) {
        console.error('Failed to copy image to clipboard:', error);
        return false;
    }
}

/**
 * Copy text to clipboard
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy text to clipboard:', error);
        // Fallback for older browsers
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

/**
 * Download an image from URL while maintaining aspect ratio
 */
export async function downloadImage(imageUrl: string, filename: string): Promise<void> {
    try {
        // Create an image element to load the image data
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        
        // Create a canvas to draw the image with the correct aspect ratio
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Determine aspect ratio from filename or use default 16:9
        const aspectRatio = filename.includes('16:9') ? '16:9' : '9:16';
        
        // Set canvas dimensions based on aspect ratio
        if (aspectRatio === '16:9') {
            canvas.width = 1280;  // Standard HD width
            canvas.height = 720;   // Standard HD height (16:9)
        } else { // 9:16
            canvas.width = 720;    // Standard portrait width
            canvas.height = 1280;   // Standard portrait height (9:16)
        }
        
        // Load the image and draw it on the canvas
        await new Promise<void>((resolve, reject) => {
            img.onload = () => {
                try {
                    // Draw the image to cover the entire canvas while maintaining aspect ratio
                    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = imageUrl;
        });
        
        // Convert canvas to blob and download
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
        // Fallback to simple download if image processing fails
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

/**
 * Check if clipboard API is supported
 */
export function isClipboardSupported(): boolean {
    return 'clipboard' in navigator && 'write' in navigator.clipboard;
}

/**
 * Check if clipboard write permission is granted
 */
export async function checkClipboardPermission(): Promise<boolean> {
    if (!isClipboardSupported()) {
        return false;
    }

    try {
        // Try to read clipboard to check permission
        await navigator.clipboard.readText();
        return true;
    } catch (error) {
        return false;
    }
}

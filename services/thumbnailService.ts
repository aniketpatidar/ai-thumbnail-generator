import { getAccessToken } from '../lib/auth';
import { getGeminiKey } from '../lib/geminiKey';

interface UserChoices {
    videoType: string;
    styleMood: string;
    photoPlacement: string;
    prompt: string;
}

type AspectRatio = '16:9' | '9:16';

export async function generateThumbnail(
    imageDataUrl: string,
    userChoices: UserChoices,
    aspectRatio: AspectRatio
): Promise<string> {
    const apiKey = getGeminiKey();
    if (!apiKey) {
        throw new Error('Add your Gemini API key to generate thumbnails.');
    }

    const response = await fetch('/api/thumbnail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await getAccessToken()}`,
            'x-gemini-api-key': apiKey
        },
        body: JSON.stringify({ image: imageDataUrl, userChoices, aspectRatio })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.error ?? `Thumbnail request failed with status ${response.status}`);
    }
    return data.image;
}

export async function regenerateThumbnail(
    imageDataUrl: string,
    userChoices: UserChoices,
    aspectRatio: AspectRatio,
    thumbnailId: number
): Promise<string> {
    console.log(`Regenerating thumbnail ${thumbnailId} with aspect ratio ${aspectRatio}`);
    return generateThumbnail(imageDataUrl, userChoices, aspectRatio);
}

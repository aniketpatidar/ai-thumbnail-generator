import { getAccessToken } from '../lib/auth';

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
    const response = await fetch('/api/thumbnail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await getAccessToken()}`
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

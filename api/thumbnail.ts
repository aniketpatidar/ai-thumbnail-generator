import { generateThumbnail, type AspectRatio } from '../server/geminiService.js';
import { getUserId } from '../server/auth.js';

const ASPECT_RATIOS: AspectRatio[] = ['16:9', '9:16'];

export async function POST(request: Request): Promise<Response> {
    if (!await getUserId(request)) {
        return Response.json({ error: 'Your session has expired. Please sign in again.' }, { status: 401 });
    }

    const { image, userChoices, aspectRatio } = await request.json().catch(() => ({}));
    const { videoType, styleMood, photoPlacement, prompt } = userChoices ?? {};
    const choicesAreValid = [videoType, styleMood, photoPlacement, prompt].every(value => typeof value === 'string');
    if (typeof image !== 'string' || !choicesAreValid || !ASPECT_RATIOS.includes(aspectRatio)) {
        return Response.json({ error: 'Invalid thumbnail request' }, { status: 400 });
    }

    try {
        const thumbnail = await generateThumbnail(image, { videoType, styleMood, photoPlacement, prompt }, aspectRatio);
        return Response.json({ image: thumbnail });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return Response.json({ error: message }, { status: 502 });
    }
}

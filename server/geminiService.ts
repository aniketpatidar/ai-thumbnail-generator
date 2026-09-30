



import { enhancePrompt, type UserChoices } from "./promptService.js";

const IMAGE_MODEL = 'gemini-3.1-flash-image';

export type AspectRatio = '16:9' | '9:16';

interface EnhancedPrompt {
    detailedPrompt: string;
    styleGuide: string;
    colorPalette: string;
    compositionNotes: string;
    textGuidance: string;
    imagePlacement: string;
    visualBalance: string;
}











export async function generateThumbnail(
    imageDataUrl: string,
    userChoices: UserChoices,
    aspectRatio: AspectRatio,
    apiKey: string
): Promise<string> {

    
    const enhancedPrompt = await enhancePrompt(userChoices, apiKey);

    
    try {

        const promptText = `
        Generate a YouTube thumbnail using the creative direction below.

        Scene
        ${enhancedPrompt.detailedPrompt}

        Design guidelines
        - Style guide: ${enhancedPrompt.styleGuide}
        - Color palette: ${enhancedPrompt.colorPalette}
        - Composition notes: ${enhancedPrompt.compositionNotes}
        - Image placement: ${enhancedPrompt.imagePlacement}
        - Visual balance: ${enhancedPrompt.visualBalance}

        Hard requirements
        1. Exact aspect ratio: ${aspectRatio}.
        2. Subject placement: place the user’s face on the ${userChoices.photoPlacement} side, occupying about 40–50% of the frame.
        3. Face quality: photorealistic, highly detailed skin texture, sharp eyes, and a clear, expressive emotion (surprise, excitement, shock, etc.) that reads even at small sizes.
        4. Head framing: center the face vertically. Scale the subject slightly smaller if needed so the full head and hairline are visible. Do not crop half the face or cut the hairline.
        5. No alterations: preserve the user’s face exactly as provided. Do not distort, retouch, or alter facial features or alignment.
        6. Text: add short bold text (3–5 words) on the opposite side of the subject. Use a large sans-serif, high-contrast colors, and an outline or shadow for readability. Text must never cover the face.
        7. Background: supportive and non-distracting — blurred, simplified, or themed to contrast with subject and text.
        8. Lighting: cinematic. Strong key light on the face, background slightly darker to increase contrast.
        9. Color and tone: highly saturated, vibrant colors optimized for visibility on YouTube’s dark UI.
        10. Composition stability: keep the subject consistent in position (no drift left or right) and maintain ratio-specific alignment.
        11. Readability: place text away from the subject and any busy background elements.
        12. Download output: final images must maintain the requested aspect ratio exactly and be suitable for direct upload to YouTube.

        Goal
        Produce a realistic, clickable YouTube thumbnail where the user’s face is the focal point, supported by bold readable text and a clean, high-contrast layout optimized for CTR.
        `;

        
        const [, inputMimeType, imageData] = imageDataUrl.match(/^data:([^;]+);base64,(.+)$/) ?? [];
        if (!inputMimeType || !imageData) {
            throw new Error('Uploaded image is not a base64 data URL');
        }

        const baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

        const response = await fetch(
            `${baseUrl}/models/${IMAGE_MODEL}:generateContent`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: promptText
                                },
                                {
                                    inlineData: {
                                        mimeType: inputMimeType,
                                        data: imageData
                                    }
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.8,
                        imageConfig: {
                            aspectRatio
                        }
                    }
                })
            }
        );

        if (!response.ok) {
            const errorBody = await response.json().catch(() => null);
            throw new Error(errorBody?.error?.message ?? `API request failed with status ${response.status}`);
        }

        const data = await response.json();
        
        
        if (!data.candidates || !data.candidates[0]?.content?.parts) {
            console.error('Invalid response from Gemini API:', data);
            throw new Error('Invalid response format from Gemini API');
        }

        
        const imagePart = data.candidates[0].content.parts.find(part => part.inlineData?.data);
        
        if (imagePart?.inlineData?.data) {
            const mimeType = imagePart.inlineData.mimeType || 'image/jpeg';
            return `data:${mimeType};base64,${imagePart.inlineData.data}`;
        }
        
        
        const textPart = data.candidates[0].content.parts.find(part => part.text);
        if (textPart?.text) {
            const imageMatch = textPart.text.match(/data:image\/[^;]+;base64,[^\s"]+/);
            if (imageMatch) {
                return imageMatch[0];
            }
        }

        console.log('Unexpected response from Gemini API:', data);
        throw new Error('The AI model did not return a valid image. Please try again with a different prompt.');

    } catch (error) {
        console.error(`Error generating ${aspectRatio} thumbnail:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        throw new Error(`The AI model failed to generate an image for aspect ratio ${aspectRatio}. Details: ${errorMessage}`);
    }
}

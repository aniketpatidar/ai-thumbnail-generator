/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import OpenAI from 'openai';
import { enhancePromptWithOpenAI } from "./promptService";

interface UserChoices {
    videoType: string;
    styleMood: string;
    photoPlacement: string;
    prompt: string;
}

interface EnhancedPrompt {
    detailedPrompt: string;
    styleGuide: string;
    colorPalette: string;
    compositionNotes: string;
    textGuidance: string;
    imagePlacement: string;
    visualBalance: string;
}

/**
 * Generates a thumbnail image based on a source image, user questionnaire choices, and aspect ratio.
 * This involves a two-step AI process:
 * 1. Generate a detailed creative prompt based on user's high-level choices using Groq API.
 * 2. Use that prompt along with the source image to generate the final thumbnail image using OpenRouter API.
 * @param imageDataUrl A data URL string of the source image.
 * @param userChoices The user's selections from the questionnaire.
 * @param aspectRatio The target aspect ratio for the thumbnail ('16:9' or '9:16').
 * @returns A promise that resolves to a base64-encoded image data URL.
 */
export async function generateThumbnail(
    imageDataUrl: string,
    userChoices: UserChoices,
    aspectRatio: '16:9' | '9:16'
): Promise<string> {

    // AI Step 1: Generate a detailed prompt from user choices using Groq API
    const enhancedPrompt = await enhancePromptWithOpenAI(userChoices);

    // AI Step 2: Use the detailed prompt and the user's image to generate the thumbnail via OpenRouter API
    try {
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY environment variable is not set');
        }

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

        const response = await fetch(
            `/api/gemini/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "gemini-2.5-flash-image-preview",
                    contents: [
                        {
                            parts: [
                                {
                                    text: promptText
                                },
                                {
                                    inlineData: {
                                        mimeType: "image/jpeg",
                                        data: imageDataUrl.split(',')[1] // Remove the data URL prefix
                                    }
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.8,
                        maxOutputTokens: 1000
                    }
                })
            }
        );

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        
        // Check if we have a valid response with content
        if (!data.candidates || !data.candidates[0]?.content?.parts) {
            console.error('Invalid response from Gemini API:', data);
            throw new Error('Invalid response format from Gemini API');
        }

        // Find the first part that contains image data
        const imagePart = data.candidates[0].content.parts.find(part => part.inlineData?.data);
        
        if (imagePart?.inlineData?.data) {
            const mimeType = imagePart.inlineData.mimeType || 'image/jpeg';
            return `data:${mimeType};base64,${imagePart.inlineData.data}`;
        }
        
        // If no inline data, check if there's a text part with a data URL
        const textPart = data.candidates[0].content.parts.find(part => part.text);
        if (textPart?.text) {
            const imageMatch = textPart.text.match(/data:image\/[^;]+;base64,[^\s"]+/);
            if (imageMatch) {
                return imageMatch[0];
            }
        }

        // If no image found in response, log the response and throw an error
        console.log('Unexpected response from Gemini API:', data);
        throw new Error('The AI model did not return a valid image. Please try again with a different prompt.');

    } catch (error) {
        console.error(`Error generating ${aspectRatio} thumbnail:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        throw new Error(`The AI model failed to generate an image for aspect ratio ${aspectRatio}. Details: ${errorMessage}`);
    }
}

/**
 * Regenerate a specific thumbnail with the same parameters
 */
export async function regenerateThumbnail(
    imageDataUrl: string,
    userChoices: UserChoices,
    aspectRatio: '16:9' | '9:16',
    thumbnailId: number
): Promise<string> {
    console.log(`Regenerating thumbnail ${thumbnailId} with aspect ratio ${aspectRatio}`);
    return generateThumbnail(imageDataUrl, userChoices, aspectRatio);
}
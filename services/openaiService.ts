/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

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
}

/**
 * Enhanced prompt rewriting service using Gemini for better creative direction
 */
export async function enhancePromptWithOpenAI(userChoices: UserChoices): Promise<EnhancedPrompt> {
    try {
        const promptGenerationContent = `You are an expert creative director specializing in viral YouTube thumbnails. Your task is to analyze user requirements and create detailed, creative prompts that will generate high-click-through-rate thumbnails.

        Create a detailed thumbnail prompt for:
        - Video Type: ${userChoices.videoType}
        - Style/Mood: ${userChoices.styleMood}
        - Photo Placement: ${userChoices.photoPlacement}
        - Creative Direction: ${userChoices.prompt}

        Return your response as a JSON object with the following structure:
        {
            "detailedPrompt": "A rich, detailed description of the visual scene, lighting, background, and aesthetic",
            "styleGuide": "Specific style notes for the AI image generator",
            "colorPalette": "Recommended color scheme and mood",
            "compositionNotes": "Layout and composition guidance"
        }

        Focus on creating a visually stunning, attention-grabbing thumbnail that will drive clicks.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: promptGenerationContent,
            config: {
                systemInstruction: "You are a creative director specializing in viral YouTube thumbnails. Your task is to translate simple user requirements into rich, detailed prompts for an image generation AI. Always respond with valid JSON.",
                temperature: 0.8,
                topK: 40,
                topP: 0.95,
            }
        });

        const content = response.text;

        if (!content) {
            throw new Error('No content received from Gemini');
        }

        try {
            const parsed = JSON.parse(content);
            return {
                detailedPrompt: parsed.detailedPrompt || '',
                styleGuide: parsed.styleGuide || '',
                colorPalette: parsed.colorPalette || '',
                compositionNotes: parsed.compositionNotes || ''
            };
        } catch (parseError) {
            // If JSON parsing fails, treat the content as a detailed prompt
            return {
                detailedPrompt: content,
                styleGuide: `Style: ${userChoices.styleMood}`,
                colorPalette: 'Vibrant, high-contrast colors',
                compositionNotes: `Place subject on ${userChoices.photoPlacement} side`
            };
        }
    } catch (error) {
        console.warn('Gemini service failed, falling back to basic enhancement:', error);
        return createBasicEnhancedPrompt(userChoices);
    }
}

function createBasicEnhancedPrompt(userChoices: UserChoices): EnhancedPrompt {
    const styleEnhancements = {
        'Bold': 'high-contrast, dramatic lighting, strong shadows',
        'Minimalist': 'clean lines, simple backgrounds, subtle gradients',
        'Dramatic': 'dark shadows, intense lighting, moody atmosphere',
        'Fun': 'bright colors, playful elements, energetic composition',
        'Vintage': 'warm tones, retro styling, film grain effect'
    };

    const videoTypeEnhancements = {
        'Tutorial': 'educational, professional, clear visual hierarchy',
        'Vlog': 'personal, authentic, relatable atmosphere',
        'Gaming': 'dynamic, high-energy, neon accents',
        'Review': 'professional, trustworthy, balanced composition',
        'Unboxing': 'excitement, anticipation, clean presentation'
    };

    const detailedPrompt = `Create a compelling ${userChoices.videoType.toLowerCase()} thumbnail with a ${userChoices.styleMood.toLowerCase()} style. ${userChoices.prompt}. The main subject should be positioned on the ${userChoices.photoPlacement.toLowerCase()} side with ${styleEnhancements[userChoices.styleMood as keyof typeof styleEnhancements] || 'professional styling'}. The overall mood should reflect ${videoTypeEnhancements[userChoices.videoType as keyof typeof videoTypeEnhancements] || 'engaging content'}.`;

    return {
        detailedPrompt,
        styleGuide: `Style: ${userChoices.styleMood}`,
        colorPalette: 'Vibrant, attention-grabbing colors',
        compositionNotes: `Subject placement: ${userChoices.photoPlacement}`
    };
}

/**
 * Generate a shareable link for thumbnails
 */
export function generateShareLink(thumbnailData: {
    videoType: string;
    styleMood: string;
    photoPlacement: string;
    prompt: string;
    thumbnails: Array<{ id: number; url: string; aspectRatio: string }>;
}): string {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
        videoType: thumbnailData.videoType,
        styleMood: thumbnailData.styleMood,
        photoPlacement: thumbnailData.photoPlacement,
        prompt: thumbnailData.prompt,
        thumbnailCount: thumbnailData.thumbnails.length.toString()
    });

    return `${baseUrl}?${params.toString()}`;
}

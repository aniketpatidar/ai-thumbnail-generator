/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import OpenAI from 'openai';

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
 * Enhanced prompt rewriting service using Groq API for fast inference
 */
export async function enhancePromptWithOpenAI(userChoices: UserChoices): Promise<EnhancedPrompt> {
    try {
        const GROQ_API_KEY = process.env.GROQ_API_KEY;
        if (!GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY environment variable is not set');
        }

        const client = new OpenAI({
            baseURL: "https://api.groq.com/openai/v1",
            apiKey: GROQ_API_KEY,
            dangerouslyAllowBrowser: true
        });

        const USER_PROMPT = `
        Generate a thumbnail design plan for:
        - Video Type: ${userChoices.videoType}
        - Style/Mood: ${userChoices.styleMood}
        - Photo Placement: ${userChoices.photoPlacement}
        - Creative Direction: ${userChoices.prompt}
        `;

        const SYSTEM_PROMPT = `
        You are a senior creative director who specializes in designing **high-performing YouTube thumbnails**. 
        Your goal is to transform simple user inputs into **detailed, production-ready thumbnail prompts** for an AI image generator. 
        Every response must be **valid JSON** following the schema below.
        
        Schema:
        {
          "detailedPrompt": "Rich description of the thumbnail scene, subject, background, and atmosphere. Be concrete and visual — specify subject’s pose, expression, clothing, and environment.",
          "styleGuide": "Precise art direction (photorealistic, cinematic, flat vector, cartoon, painterly, etc.) with references if useful.",
          "colorPalette": "Exact scheme — include 3-5 core colors and describe their emotional effect (e.g., 'vibrant red + yellow for urgency, dark background for contrast').",
          "compositionNotes": "Guidance on framing (close-up vs wide shot), focal points, spacing, and use of negative space.",
          "textGuidance": "Instructions for text overlay — size, font style (bold/clean/futuristic/handwritten), placement (top-left, bottom-right, center), and contrast requirements.",
          "imagePlacement": "Where to position the user’s photo or main subject (left/right/center/foreground/background). Be explicit.",
          "visualBalance": "Rules to balance subject, text, and background — e.g., 'subject on left, bold text on right with high contrast; background blurred to emphasize subject'."
        }
        
        Rules:
        - Always produce specific, **actionable** design directions — avoid vague terms like "make it look nice".
        - Assume the goal is **maximum CTR**: high-contrast, bold, emotional, legible on small screens.
        - Consider common YouTube design psychology: big expressive faces, emotional storytelling, strong diagonals, clear subject separation.
        - If user input is too vague, make creative assumptions but explain them in the JSON fields.
        - NEVER include logos, watermarks, or extra borders.
        - Make sure the response is strictly valid JSON (no extra commentary).
        `;
        const completion = await client.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT
                },
                {
                    role: "user",
                    content: USER_PROMPT
                }
            ],
            temperature: 0.8,
            max_tokens: 1000
        });

        const content = completion.choices[0]?.message?.content;

        if (!content) {
            throw new Error('No content received from Groq API');
        }

        try {
            const parsed = JSON.parse(content);
            return {
                detailedPrompt: parsed.detailedPrompt || '',
                styleGuide: parsed.styleGuide || '',
                colorPalette: parsed.colorPalette || '',
                compositionNotes: parsed.compositionNotes || '',
                textGuidance: parsed.textGuidance || '',
                imagePlacement: parsed.imagePlacement || '',
                visualBalance: parsed.visualBalance || ''
            };
        } catch (parseError) {
            // If JSON parsing fails, treat the content as a detailed prompt
            return {
                detailedPrompt: content,
                styleGuide: `Style: ${userChoices.styleMood}`,
                colorPalette: 'Vibrant, high-contrast colors',
                compositionNotes: `Place subject on ${userChoices.photoPlacement} side`,
                textGuidance: 'Large, bold text in upper-left area with dark outlines for readability',
                imagePlacement: `Position user photo on ${userChoices.photoPlacement} side, occupying roughly half the frame`,
                visualBalance: 'Ensure text and image don\'t overlap, maintain clear visual hierarchy'
            };
        }
    } catch (error) {
        console.warn('Groq API service failed, falling back to basic enhancement:', error);
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

    const textPlacementGuidance = {
        'Left': 'Large, bold text in upper-left area, avoid overlapping with user photo',
        'Center': 'Text positioned above or below the centered user photo',
        'Right': 'Large, bold text in upper-left area, user photo on right side'
    };

    const imagePlacementGuidance = {
        'Left': 'User photo positioned on left side, occupying roughly 40-50% of frame width',
        'Center': 'User photo centered, with text positioned above or below',
        'Right': 'User photo positioned on right side, occupying roughly 40-50% of frame width'
    };

    const detailedPrompt = `Create a compelling ${userChoices.videoType.toLowerCase()} thumbnail with a ${userChoices.styleMood.toLowerCase()} style. ${userChoices.prompt}. The main subject should be positioned on the ${userChoices.photoPlacement.toLowerCase()} side with ${styleEnhancements[userChoices.styleMood as keyof typeof styleEnhancements] || 'professional styling'}. The overall mood should reflect ${videoTypeEnhancements[userChoices.videoType as keyof typeof videoTypeEnhancements] || 'engaging content'}.`;

    return {
        detailedPrompt,
        styleGuide: `Style: ${userChoices.styleMood}`,
        colorPalette: 'Vibrant, attention-grabbing colors',
        compositionNotes: `Subject placement: ${userChoices.photoPlacement}`,
        textGuidance: textPlacementGuidance[userChoices.photoPlacement as keyof typeof textPlacementGuidance] || 'Large, bold text with dark outlines for readability',
        imagePlacement: imagePlacementGuidance[userChoices.photoPlacement as keyof typeof imagePlacementGuidance] || `Position user photo on ${userChoices.photoPlacement} side`,
        visualBalance: 'Ensure text and image don\'t overlap, maintain clear visual hierarchy with proper spacing'
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

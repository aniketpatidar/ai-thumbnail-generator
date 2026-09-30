const STORAGE_KEY = 'gemini_api_key';

export function getGeminiKey(): string | null {
    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
}

export function saveGeminiKey(apiKey: string): void {
    localStorage.setItem(STORAGE_KEY, apiKey);
}

export function clearGeminiKey(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        return;
    }
}

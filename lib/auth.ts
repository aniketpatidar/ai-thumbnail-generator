import { createClient, type Session } from '@supabase/supabase-js';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export async function signInWithGoogle(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
    });
    if (error) {
        throw error;
    }
}

export async function signOut(): Promise<void> {
    await supabase.auth.signOut();
}

export async function getAccessToken(): Promise<string | undefined> {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
}

export function onSessionChange(callback: (session: Session | null) => void): () => void {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
    return () => data.subscription.unsubscribe();
}

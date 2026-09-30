import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | undefined;

function getSupabase(): SupabaseClient {
    const url = process.env.VITE_SUPABASE_URL;
    const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !publishableKey) {
        throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY environment variables must be set');
    }
    supabase ??= createClient(url, publishableKey, {
        auth: { persistSession: false, autoRefreshToken: false }
    });
    return supabase;
}

export async function getUserId(request: Request): Promise<string | null> {
    const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
    if (!token) {
        return null;
    }
    const { data, error } = await getSupabase().auth.getClaims(token);
    return error ? null : data?.claims.sub ?? null;
}

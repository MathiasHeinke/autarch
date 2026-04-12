/**
 * Supabase Client — BYOK (Bring Your Own Key) Pattern
 * 
 * AUTARCH does not own the Supabase instance. It reads
 * credentials from localStorage (set via Settings → API Keys)
 * with fallback to environment variables for development.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'autarch_supabase_url';
const STORAGE_KEY_ANON = 'autarch_supabase_anon_key';

let _client: SupabaseClient | null = null;

/**
 * Get configured Supabase URL.
 * Priority: localStorage → env → empty
 */
export function getSupabaseUrl(): string {
  return (
    localStorage.getItem(STORAGE_KEY_URL) ??
    import.meta.env.VITE_SUPABASE_URL ??
    ''
  );
}

/**
 * Get configured Supabase anon key.
 */
export function getSupabaseAnonKey(): string {
  return (
    localStorage.getItem(STORAGE_KEY_ANON) ??
    import.meta.env.VITE_SUPABASE_ANON_KEY ??
    ''
  );
}

/**
 * Check if Supabase credentials are configured.
 */
export function isSupabaseConfigured(): boolean {
  return !!(getSupabaseUrl() && getSupabaseAnonKey());
}

/**
 * Save Supabase credentials to localStorage (BYOK).
 * Invalidates the cached client so the next call to getSupabase() creates a fresh one.
 */
export function setSupabaseCredentials(url: string, anonKey: string): void {
  localStorage.setItem(STORAGE_KEY_URL, url);
  localStorage.setItem(STORAGE_KEY_ANON, anonKey);
  _client = null; // Force re-create
}

/**
 * Get (or create) the Supabase client singleton.
 * Returns null if credentials are not configured.
 */
export function getSupabase(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!url || !anonKey) return null;

  if (!_client) {
    _client = createClient(url, anonKey, {
      auth: { persistSession: false },
    });
  }

  return _client;
}

/**
 * Get the Supabase project URL for Edge Function calls.
 * Edge Functions live at: {project_url}/functions/v1/{function_name}
 */
export function getEdgeFunctionBaseUrl(): string {
  return getSupabaseUrl();
}

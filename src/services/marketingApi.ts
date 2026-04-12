/**
 * Marketing API Service — Edge Function Caller
 * 
 * Wraps calls to cms-dist-generator and cms-dist-publisher
 * with proper auth headers and error handling.
 */
import { getEdgeFunctionBaseUrl, getSupabaseAnonKey } from './supabaseClient';

// ─── Auth ───────────────────────────────────────────────────────

const OPERATOR_SECRET_KEY = 'autarch_operator_secret';

export function getOperatorSecret(): string {
  return localStorage.getItem(OPERATOR_SECRET_KEY) ?? '';
}

export function setOperatorSecret(secret: string): void {
  localStorage.setItem(OPERATOR_SECRET_KEY, secret);
}

// ─── Core Caller ────────────────────────────────────────────────

async function callEdgeFunction<T = unknown>(
  functionName: string,
  params?: Record<string, string>,
  options?: { method?: string; body?: unknown },
): Promise<T> {
  const base = getEdgeFunctionBaseUrl();
  if (!base) throw new Error('Supabase URL not configured. Go to Settings → API Keys.');

  const url = new URL(`/functions/v1/${functionName}`, base);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Auth: prefer operator secret, fallback to anon key
  const secret = getOperatorSecret();
  if (secret) {
    headers['x-operator-secret'] = secret;
  } else {
    const anonKey = getSupabaseAnonKey();
    if (anonKey) {
      headers['Authorization'] = `Bearer ${anonKey}`;
    }
  }

  const res = await fetch(url.toString(), {
    method: options?.method ?? (options?.body ? 'POST' : 'GET'),
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`Edge Function ${functionName} failed: ${res.status} ${errorText}`);
  }

  return res.json() as Promise<T>;
}

// ─── Generator ──────────────────────────────────────────────────

export interface GenerateResult {
  processed: number;
  results: { article_id: string; platforms: string[] }[];
}

/** Generate drafts for top SEO articles (batch mode) */
export async function generateDraftsBatch(limit = 3): Promise<GenerateResult> {
  return callEdgeFunction<GenerateResult>('cms-dist-generator', {
    mode: 'batch',
    limit: String(limit),
  });
}

/** Generate drafts for a specific article */
export async function generateDraftsSingle(articleId: string): Promise<GenerateResult> {
  return callEdgeFunction<GenerateResult>('cms-dist-generator', {
    mode: 'single',
    id: articleId,
  });
}

// ─── Publisher ───────────────────────────────────────────────────

export interface PublishStats {
  total_drafts: number;
  total_approved: number;
  total_scheduled: number;
  total_published: number;
  total_failed: number;
  by_platform: Record<string, number>;
}

/** Get aggregated distribution stats */
export async function fetchPublishStats(): Promise<PublishStats> {
  return callEdgeFunction<PublishStats>('cms-dist-publisher', { mode: 'stats' });
}

/** Dry-run preview of what would be published */
export async function previewDraft(distributionId: string): Promise<unknown> {
  return callEdgeFunction('cms-dist-publisher', {
    mode: 'preview',
    id: distributionId,
  }, { method: 'POST' });
}

/** Force-publish all approved distributions now */
export async function publishNow(): Promise<unknown> {
  return callEdgeFunction('cms-dist-publisher', { mode: 'publish' }, { method: 'POST' });
}

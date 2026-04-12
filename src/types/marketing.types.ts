/**
 * ARES Marketing Pipeline — Type Definitions
 * 
 * Maps 1:1 to the Supabase `content_distributions` table
 * and related enums / JSONB structures.
 */

// ─── Enums ──────────────────────────────────────────────────────

export type DistributionPlatform =
  | 'newsletter'
  | 'x_article'
  | 'x_thread'
  | 'x_quote'
  | 'reddit'
  | 'linkedin'
  | 'instagram'
  | 'tiktok'
  | 'youtube';

export type DistributionStatus =
  | 'draft'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'failed'
  | 'archived';

export type DistributionSource = 'blog_derived' | 'social_native';

// ─── Platform-Specific Metadata (Discriminated Union) ───────────

export interface NewsletterMeta {
  subject_line: string;
  preview_text: string;
  cta_text: string;
  cta_url: string;
}

export interface XArticleMeta {
  title: string;
  cta_url: string;
}

export interface XThreadMeta {
  tweet_count: number;
  tweets: string[];
}

export interface XQuoteMeta {
  cta_url?: string;
}

export interface RedditMeta {
  post_title: string;
  subreddits: string[];
  flair?: string;
}

export interface LinkedInMeta {
  headline: string;
  hashtags: string[];
  cta_url?: string;
}

export type PlatformMetadata =
  | NewsletterMeta
  | XArticleMeta
  | XThreadMeta
  | XQuoteMeta
  | RedditMeta
  | LinkedInMeta
  | Record<string, unknown>; // fallback for new platforms

// ─── Core Data Model ────────────────────────────────────────────

export interface ContentDistribution {
  id: string;
  article_id: string | null;
  platform: DistributionPlatform;
  status: DistributionStatus;
  source_type: DistributionSource;
  content_text: string;
  content_html: string | null;
  content_media_urls: string[] | null;
  published_url: string | null;
  scheduled_for: string | null; // ISO timestamp
  metadata: PlatformMetadata | null;
  condensate: Record<string, unknown> | null;
  error_log: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Source Article (Read-Only) ─────────────────────────────────

export interface ResearchArticle {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  hero_image_url: string | null;
  seo_score: number | null;
}

// ─── Stats Response ─────────────────────────────────────────────

export interface DistributionStats {
  total_drafts: number;
  total_approved: number;
  total_scheduled: number;
  total_published: number;
  total_failed: number;
  by_platform: Partial<Record<DistributionPlatform, number>>;
}

// ─── Kanban Column Config ───────────────────────────────────────

export const KANBAN_COLUMNS: { id: DistributionStatus; label: string; color: string }[] = [
  { id: 'draft', label: 'Drafts', color: 'var(--color-text-tertiary)' },
  { id: 'approved', label: 'Approved', color: 'var(--color-accent)' },
  { id: 'scheduled', label: 'Scheduled', color: 'var(--color-info)' },
  { id: 'published', label: 'Published', color: 'var(--color-success)' },
];

// ─── Platform Display Config ────────────────────────────────────

export const PLATFORM_CONFIG: Record<DistributionPlatform, { label: string; color: string; charLimit?: number }> = {
  newsletter:  { label: 'Newsletter', color: '#6366f1' },
  x_article:   { label: 'X Article',  color: '#06b6d4' },
  x_thread:    { label: 'X Thread',   color: '#06b6d4', charLimit: 280 },
  x_quote:     { label: 'X Quote',    color: '#06b6d4', charLimit: 280 },
  reddit:      { label: 'Reddit',     color: '#f97316' },
  linkedin:    { label: 'LinkedIn',   color: '#8b5cf6', charLimit: 3000 },
  instagram:   { label: 'Instagram',  color: '#ec4899', charLimit: 2200 },
  tiktok:      { label: 'TikTok',     color: '#14b8a6' },
  youtube:     { label: 'YouTube',    color: '#ef4444' },
};

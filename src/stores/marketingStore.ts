import { create } from 'zustand';
import { getSupabase, isSupabaseConfigured } from '../services/supabaseClient';
import * as marketingApi from '../services/marketingApi';
import type {
  ContentDistribution,
  DistributionPlatform,
  DistributionStatus,
  DistributionStats,
  ResearchArticle,
  PlatformMetadata,
} from '../types/marketing.types';

// ─── Mock data for when Supabase is not configured ──────────────

const MOCK_DISTRIBUTIONS: ContentDistribution[] = [
  {
    id: 'mock-1', article_id: 'art-1', platform: 'newsletter', status: 'draft',
    source_type: 'blog_derived', content_text: 'NAD+ Supplementation Shows Promise in Latest Clinical Trial\n\nA groundbreaking study published in Nature Aging reveals that daily NAD+ supplementation at 500mg significantly improved cellular repair markers in adults over 40...',
    content_html: null, content_media_urls: null, published_url: null, scheduled_for: null,
    metadata: { subject_line: 'Breaking: NAD+ Clinical Results Are In', preview_text: 'What the latest research means for your protocol', cta_text: 'Read Full Analysis', cta_url: '/research/nad-clinical-trial' },
    condensate: null, error_log: null, created_at: '2026-04-12T10:00:00Z', updated_at: '2026-04-12T10:00:00Z',
  },
  {
    id: 'mock-2', article_id: 'art-2', platform: 'x_thread', status: 'draft',
    source_type: 'blog_derived', content_text: '🧬 Thread: Why Sleep is the #1 Longevity Lever\n\n---\n\n1/ Most biohackers obsess over supplements. But the data is clear: sleep quality beats everything.\n\n---\n\n2/ A 2025 meta-analysis of 47 studies found that consistent 7-8h sleep reduced all-cause mortality by 23%.\n\n---\n\n3/ Here\'s what the ARES engine tracks for optimal sleep...',
    content_html: null, content_media_urls: null, published_url: null, scheduled_for: null,
    metadata: { tweet_count: 5, tweets: ['🧬 Thread: Why Sleep is the #1 Longevity Lever', '1/ Most biohackers obsess over supplements...', '2/ A 2025 meta-analysis of 47 studies found...', '3/ Here\'s what the ARES engine tracks...', '5/ Follow @ARES_OS for more data-driven longevity insights.'] },
    condensate: null, error_log: null, created_at: '2026-04-12T09:30:00Z', updated_at: '2026-04-12T09:30:00Z',
  },
  {
    id: 'mock-3', article_id: 'art-1', platform: 'reddit', status: 'approved',
    source_type: 'blog_derived', content_text: 'Just came across a fascinating clinical trial on NAD+ supplementation that actually has solid methodology. Unlike most supplement studies, this one used proper controls and biomarker tracking...',
    content_html: null, content_media_urls: null, published_url: null, scheduled_for: '2026-04-14T09:00:00Z',
    metadata: { post_title: 'New NAD+ clinical trial with actual rigorous methodology — here\'s what they found', subreddits: ['r/Biohacking', 'r/longevity', 'r/Supplements'], flair: 'research' },
    condensate: null, error_log: null, created_at: '2026-04-11T14:00:00Z', updated_at: '2026-04-12T08:00:00Z',
  },
  {
    id: 'mock-4', article_id: 'art-3', platform: 'linkedin', status: 'scheduled',
    source_type: 'blog_derived', content_text: 'The future of preventive medicine isn\'t in hospitals — it\'s in your data.\n\nAt ARES, we\'ve built an engine that processes 47 biomarkers from wearables, blood panels, and genetics to compute your biological age in real-time.\n\nHere\'s what we learned from analyzing 10,000+ data points...',
    content_html: null, content_media_urls: ['https://example.com/hero-linkedin.jpg'], published_url: null, scheduled_for: '2026-04-15T12:00:00Z',
    metadata: { headline: 'Your Biological Age is a Number — and It\'s Computable', hashtags: ['#biohacking', '#longevity', '#healthtech', '#preventivemedicine'], cta_url: 'https://ares.health/bio-age' },
    condensate: null, error_log: null, created_at: '2026-04-10T10:00:00Z', updated_at: '2026-04-12T06:00:00Z',
  },
  {
    id: 'mock-5', article_id: 'art-2', platform: 'newsletter', status: 'published',
    source_type: 'blog_derived', content_text: 'The Science of Sleep Optimization — ARES Weekly Digest\n\nThis week we deep-dive into the compound effects of sleep quality on biological age...',
    content_html: null, content_media_urls: null, published_url: 'https://newsletter.ares.health/sleep-optimization-042026', scheduled_for: '2026-04-10T08:00:00Z',
    metadata: { subject_line: 'Sleep is Your Best Supplement', preview_text: 'New data on sleep quality and biological age', cta_text: 'Read More', cta_url: '/research/sleep-optimization' },
    condensate: null, error_log: null, created_at: '2026-04-08T10:00:00Z', updated_at: '2026-04-10T08:05:00Z',
  },
  {
    id: 'mock-6', article_id: null, platform: 'x_quote', status: 'draft',
    source_type: 'social_native', content_text: '"The best longevity protocol is the one you actually follow." — Track your consistency, not just your supplements. 📊',
    content_html: null, content_media_urls: null, published_url: null, scheduled_for: null,
    metadata: {},
    condensate: null, error_log: null, created_at: '2026-04-12T11:00:00Z', updated_at: '2026-04-12T11:00:00Z',
  },
];

// ─── Store ──────────────────────────────────────────────────────

interface MarketingState {
  distributions: ContentDistribution[];
  selectedId: string | null;
  filter: {
    platform: DistributionPlatform | 'all';
    status: DistributionStatus | 'all';
  };
  stats: DistributionStats | null;
  sourceArticles: Record<string, ResearchArticle>;
  loading: boolean;
  error: string | null;

  // Actions
  fetchDistributions: () => Promise<void>;
  setFilter: (f: Partial<MarketingState['filter']>) => void;
  setSelectedId: (id: string | null) => void;
  updateStatus: (id: string, status: DistributionStatus, scheduledFor?: string) => Promise<void>;
  updateContent: (id: string, content: string, metadata?: PlatformMetadata) => Promise<void>;
  archiveDistribution: (id: string) => Promise<void>;
  generateDrafts: (articleId?: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  getFilteredDistributions: () => ContentDistribution[];
}

export const useMarketingStore = create<MarketingState>((set, get) => ({
  distributions: [],
  selectedId: null,
  filter: { platform: 'all', status: 'all' },
  stats: null,
  sourceArticles: {},
  loading: false,
  error: null,

  fetchDistributions: async () => {
    set({ loading: true, error: null });

    if (!isSupabaseConfigured()) {
      // Use mock data when Supabase is not connected
      set({ distributions: MOCK_DISTRIBUTIONS, loading: false });
      return;
    }

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error('Supabase not configured');

      let query = supabase
        .from('content_distributions')
        .select('*')
        .order('created_at', { ascending: false });

      const { filter } = get();
      if (filter.platform !== 'all') {
        query = query.eq('platform', filter.platform);
      }
      if (filter.status !== 'all') {
        query = query.eq('status', filter.status);
      }

      const { data, error } = await query;
      if (error) throw error;

      set({ distributions: (data as ContentDistribution[]) ?? [], loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  setFilter: (f) => {
    set((s) => ({ filter: { ...s.filter, ...f } }));
    get().fetchDistributions();
  },

  setSelectedId: (id) => set({ selectedId: id }),

  updateStatus: async (id, status, scheduledFor) => {
    const supabase = getSupabase();

    if (!supabase) {
      // Mock mode: update locally
      set((s) => ({
        distributions: s.distributions.map((d) =>
          d.id === id ? { ...d, status, scheduled_for: scheduledFor ?? d.scheduled_for } : d,
        ),
      }));
      return;
    }

    const update: Record<string, unknown> = { status };
    if (scheduledFor) update.scheduled_for = scheduledFor;

    const { error } = await supabase
      .from('content_distributions')
      .update(update)
      .eq('id', id);

    if (error) throw error;
    await get().fetchDistributions();
  },

  updateContent: async (id, content, metadata) => {
    const supabase = getSupabase();

    if (!supabase) {
      set((s) => ({
        distributions: s.distributions.map((d) =>
          d.id === id ? { ...d, content_text: content, metadata: metadata ?? d.metadata } : d,
        ),
      }));
      return;
    }

    const update: Record<string, unknown> = { content_text: content };
    if (metadata) update.metadata = metadata;

    const { error } = await supabase
      .from('content_distributions')
      .update(update)
      .eq('id', id);

    if (error) throw error;
    await get().fetchDistributions();
  },

  archiveDistribution: async (id) => {
    await get().updateStatus(id, 'archived');
  },

  generateDrafts: async (articleId) => {
    set({ loading: true, error: null });
    try {
      if (articleId) {
        await marketingApi.generateDraftsSingle(articleId);
      } else {
        await marketingApi.generateDraftsBatch(3);
      }
      await get().fetchDistributions();
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await marketingApi.fetchPublishStats();
      set({ stats });
    } catch {
      // Stats are non-critical, just compute from local data
      const { distributions } = get();
      set({
        stats: {
          total_drafts: distributions.filter((d) => d.status === 'draft').length,
          total_approved: distributions.filter((d) => d.status === 'approved').length,
          total_scheduled: distributions.filter((d) => d.status === 'scheduled').length,
          total_published: distributions.filter((d) => d.status === 'published').length,
          total_failed: distributions.filter((d) => d.status === 'failed').length,
          by_platform: {},
        },
      });
    }
  },

  getFilteredDistributions: () => {
    const { distributions, filter } = get();
    return distributions.filter((d) => {
      if (filter.platform !== 'all' && d.platform !== filter.platform) return false;
      if (filter.status !== 'all' && d.status !== filter.status) return false;
      return true;
    });
  },
}));

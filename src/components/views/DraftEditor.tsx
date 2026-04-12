import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Calendar,
  Send,
  Archive,
  Eye,
  FileText,
  Hash,
  Tag,
  Link2,
  Type,
  AtSign,
} from 'lucide-react';
import { useMarketingStore } from '../../stores/marketingStore';
import { useLayoutStore } from '../../stores/layoutStore';
import {
  PLATFORM_CONFIG,
  type NewsletterMeta,
  type XThreadMeta,
  type RedditMeta,
  type LinkedInMeta,
} from '../../types/marketing.types';

// ─── Helpers ────────────────────────────────────────────────────

function charCount(text: string, limit?: number): string {
  const len = text.length;
  if (!limit) return `${len} chars`;
  return `${len} / ${limit}`;
}

function StatusPill({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    draft: { bg: 'rgba(113,113,122,0.15)', text: 'var(--color-text-tertiary)' },
    approved: { bg: 'rgba(245,158,11,0.12)', text: 'var(--color-accent)' },
    scheduled: { bg: 'rgba(99,102,241,0.12)', text: 'var(--color-info)' },
    published: { bg: 'rgba(16,185,129,0.12)', text: 'var(--color-success)' },
    failed: { bg: 'rgba(239,68,68,0.12)', text: 'var(--color-error)' },
    archived: { bg: 'rgba(113,113,122,0.08)', text: 'var(--color-text-tertiary)' },
  };
  const c = colors[status] ?? colors.draft;
  return (
    <span
      className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider"
      style={{ background: c.bg, color: c.text, fontFamily: 'var(--font-mono)' }}
    >
      {status}
    </span>
  );
}

// ─── Metadata Editors ───────────────────────────────────────────

function MetaField({ label, value, icon: Icon, onChange }: {
  label: string; value: string; icon: typeof Type; onChange: (v: string) => void;
}) {
  return (
    <div className="mb-3">
      <label className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3 h-3" style={{ color: 'var(--color-text-tertiary)' }} />
        <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
          {label}
        </span>
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-md text-xs outline-none"
        style={{
          background: 'var(--color-surface-component)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border-ghost)',
          fontFamily: 'var(--font-body)',
        }}
      />
    </div>
  );
}

function TagField({ label, values, icon: Icon, onChange }: {
  label: string; values: string[]; icon: typeof Tag; onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
      setInput('');
    }
  };

  return (
    <div className="mb-3">
      <label className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3 h-3" style={{ color: 'var(--color-text-tertiary)' }} />
        <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
          {label}
        </span>
      </label>
      <div className="flex flex-wrap gap-1 mb-1.5">
        {values.map((tag, i) => (
          <span
            key={i}
            className="px-2 py-0.5 rounded text-[10px] font-medium cursor-pointer"
            style={{ background: 'var(--color-surface-interactive)', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}
            onClick={() => onChange(values.filter((_, j) => j !== i))}
            title="Click to remove"
          >
            {tag} ×
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
        placeholder="Add tag + Enter"
        className="w-full px-3 py-2 rounded-md text-xs outline-none"
        style={{
          background: 'var(--color-surface-component)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border-ghost)',
        }}
      />
    </div>
  );
}

function NewsletterEditor({ meta, onChange }: { meta: NewsletterMeta; onChange: (m: NewsletterMeta) => void }) {
  return (
    <>
      <MetaField label="Subject Line" value={meta.subject_line} icon={Type} onChange={(v) => onChange({ ...meta, subject_line: v })} />
      <MetaField label="Preview Text" value={meta.preview_text} icon={Eye} onChange={(v) => onChange({ ...meta, preview_text: v })} />
      <MetaField label="CTA Text" value={meta.cta_text} icon={Send} onChange={(v) => onChange({ ...meta, cta_text: v })} />
      <MetaField label="CTA URL" value={meta.cta_url} icon={Link2} onChange={(v) => onChange({ ...meta, cta_url: v })} />
    </>
  );
}

function XThreadEditor({ meta, onChange }: { meta: XThreadMeta; onChange: (m: XThreadMeta) => void }) {
  return (
    <>
      <div className="mb-3">
        <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
          {meta.tweet_count} Tweets
        </span>
      </div>
      {meta.tweets.map((tweet, i) => (
        <div key={i} className="mb-2">
          <label className="text-[9px] mb-0.5 block" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            Tweet {i + 1} ({tweet.length}/280)
          </label>
          <textarea
            value={tweet}
            onChange={(e) => {
              const newTweets = [...meta.tweets];
              newTweets[i] = e.target.value;
              onChange({ ...meta, tweets: newTweets, tweet_count: newTweets.length });
            }}
            className="w-full px-3 py-2 rounded-md text-xs outline-none resize-none"
            rows={2}
            maxLength={280}
            style={{
              background: 'var(--color-surface-component)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-ghost)',
            }}
          />
        </div>
      ))}
    </>
  );
}

function RedditEditor({ meta, onChange }: { meta: RedditMeta; onChange: (m: RedditMeta) => void }) {
  return (
    <>
      <MetaField label="Post Title" value={meta.post_title} icon={Type} onChange={(v) => onChange({ ...meta, post_title: v })} />
      <TagField label="Subreddits" values={meta.subreddits} icon={Hash} onChange={(v) => onChange({ ...meta, subreddits: v })} />
      <MetaField label="Flair" value={meta.flair ?? ''} icon={Tag} onChange={(v) => onChange({ ...meta, flair: v })} />
    </>
  );
}

function LinkedInEditor({ meta, onChange }: { meta: LinkedInMeta; onChange: (m: LinkedInMeta) => void }) {
  return (
    <>
      <MetaField label="Headline" value={meta.headline} icon={Type} onChange={(v) => onChange({ ...meta, headline: v })} />
      <TagField label="Hashtags" values={meta.hashtags} icon={Hash} onChange={(v) => onChange({ ...meta, hashtags: v })} />
      <MetaField label="CTA URL" value={meta.cta_url ?? ''} icon={Link2} onChange={(v) => onChange({ ...meta, cta_url: v })} />
    </>
  );
}

// ─── Main Editor ────────────────────────────────────────────────

export function DraftEditor() {
  const { distributions, selectedId, setSelectedId, updateContent, updateStatus } = useMarketingStore();
  const { setActiveContextView } = useLayoutStore();

  const dist = distributions.find((d) => d.id === selectedId) ?? null;
  const [localContent, setLocalContent] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [localMeta, setLocalMeta] = useState<any>({});
  const [saved, setSaved] = useState(true);
  const [scheduleDate, setScheduleDate] = useState('');

  // Sync from store
  useEffect(() => {
    if (dist) {
      setLocalContent(dist.content_text);
      setLocalMeta((dist.metadata as Record<string, unknown>) ?? {});
      setScheduleDate(dist.scheduled_for ?? '');
      setSaved(true);
    }
  }, [dist]);

  if (!dist) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-text-tertiary)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-tertiary)' }}>No draft selected</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>Select a card from the Content Pipeline</p>
          <motion.button
            onClick={() => setActiveContextView('pipeline')}
            className="mt-4 px-4 py-2 rounded-md text-xs font-medium"
            style={{
              background: 'var(--color-surface-interactive)',
              color: 'var(--color-accent)',
              border: '1px solid var(--color-border-active)',
            }}
            whileHover={{ boxShadow: '0 0 12px var(--color-accent-glow)' }}
          >
            ← Back to Pipeline
          </motion.button>
        </div>
      </div>
    );
  }

  const config = PLATFORM_CONFIG[dist.platform];
  const handleSave = async () => {
    await updateContent(dist.id, localContent, localMeta ?? undefined);
    setSaved(true);
  };

  const handleApproveSchedule = async () => {
    if (scheduleDate) {
      await updateStatus(dist.id, 'scheduled', scheduleDate);
    } else {
      await updateStatus(dist.id, 'approved');
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Editor Header */}
      <div
        className="flex items-center gap-3 px-5 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--color-border-ghost)', background: 'var(--color-surface-section)' }}
      >
        <motion.button
          onClick={() => { setSelectedId(null); setActiveContextView('pipeline'); }}
          className="flex items-center gap-1 text-xs"
          style={{ color: 'var(--color-text-tertiary)' }}
          whileHover={{ color: 'var(--color-accent)', x: -2 }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Pipeline
        </motion.button>
        <div className="w-px h-4" style={{ background: 'var(--color-border-ghost)' }} />
        <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: config.color, fontFamily: 'var(--font-mono)' }}>
          {config.label}
        </span>
        <StatusPill status={dist.status} />
        <div className="ml-auto flex items-center gap-2">
          {!saved && (
            <span className="text-[10px]" style={{ color: 'var(--color-warning)', fontFamily: 'var(--font-mono)' }}>
              unsaved changes
            </span>
          )}
          <motion.button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium"
            style={{
              background: saved ? 'var(--color-surface-component)' : 'var(--color-accent)',
              color: saved ? 'var(--color-text-tertiary)' : '#000',
              border: saved ? '1px solid var(--color-border-ghost)' : 'none',
            }}
            whileHover={saved ? { borderColor: 'var(--color-border-active)' } : { scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Save className="w-3 h-3" />
            Save
          </motion.button>
        </div>
      </div>

      {/* Editor Body — 3-Panel Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Source Context (30%) */}
        <div
          className="w-[28%] flex-shrink-0 overflow-y-auto p-4"
          style={{ borderRight: '1px solid var(--color-border-ghost)', background: 'var(--color-surface-base)' }}
        >
          <h3 className="text-[10px] uppercase tracking-wider font-semibold mb-3" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            Source Context
          </h3>

          {dist.article_id ? (
            <div className="space-y-3">
              <div className="rounded-lg p-3" style={{ background: 'var(--color-surface-section)', border: '1px solid var(--color-border-ghost)' }}>
                <span className="text-[9px] uppercase tracking-wider mb-1 block" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                  Article ID
                </span>
                <p className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>{dist.article_id}</p>
              </div>
              <div className="rounded-lg p-3" style={{ background: 'var(--color-surface-section)', border: '1px solid var(--color-border-ghost)' }}>
                <span className="text-[9px] uppercase tracking-wider mb-1 block" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                  Source Type
                </span>
                <p className="text-xs font-medium" style={{ color: 'var(--color-accent)' }}>{dist.source_type}</p>
              </div>
              {dist.condensate && (
                <div className="rounded-lg p-3" style={{ background: 'var(--color-surface-section)', border: '1px solid var(--color-border-ghost)' }}>
                  <span className="text-[9px] uppercase tracking-wider mb-1 block" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                    Condensate
                  </span>
                  <pre className="text-[10px] whitespace-pre-wrap" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {JSON.stringify(dist.condensate, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg p-4 text-center" style={{ background: 'var(--color-surface-section)', border: '1px solid var(--color-border-ghost)' }}>
              <AtSign className="w-6 h-6 mx-auto mb-2" style={{ color: 'rgba(236,72,153,0.5)' }} />
              <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Social-Native</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>No source article</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)' }}>
              <span>created</span>
              <span>{new Date(dist.created_at).toLocaleDateString('de-DE')}</span>
            </div>
            <div className="flex justify-between text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)' }}>
              <span>updated</span>
              <span>{new Date(dist.updated_at).toLocaleDateString('de-DE')}</span>
            </div>
          </div>
        </div>

        {/* Center: Content Editor (44%) */}
        <div className="flex-1 flex flex-col overflow-hidden p-4" style={{ background: 'var(--color-surface-base)' }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              Content
            </h3>
            <span className="text-[10px]" style={{ color: config.charLimit && localContent.length > config.charLimit ? 'var(--color-error)' : 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              {charCount(localContent, config.charLimit)}
            </span>
          </div>
          <textarea
            value={localContent}
            onChange={(e) => { setLocalContent(e.target.value); setSaved(false); }}
            className="flex-1 w-full rounded-lg p-4 text-[13px] leading-relaxed outline-none resize-none"
            style={{
              background: 'var(--color-surface-section)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-ghost)',
              fontFamily: 'var(--font-body)',
            }}
            placeholder="Write your content here..."
          />
        </div>

        {/* Right: Metadata Panel (28%) */}
        <div
          className="w-[28%] flex-shrink-0 flex flex-col overflow-y-auto p-4"
          style={{ borderLeft: '1px solid var(--color-border-ghost)', background: 'var(--color-surface-base)' }}
        >
          <h3 className="text-[10px] uppercase tracking-wider font-semibold mb-3" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            Platform Metadata
          </h3>

          {/* Dynamic Metadata Editor */}
          {dist.platform === 'newsletter' && (
            <NewsletterEditor
              meta={localMeta as unknown as NewsletterMeta}
              onChange={(m) => { setLocalMeta(m); setSaved(false); }}
            />
          )}
          {(dist.platform === 'x_thread') && (
            <XThreadEditor
              meta={localMeta as unknown as XThreadMeta}
              onChange={(m) => { setLocalMeta(m as unknown as Record<string, unknown>); setSaved(false); }}
            />
          )}
          {dist.platform === 'reddit' && (
            <RedditEditor
              meta={localMeta as unknown as RedditMeta}
              onChange={(m) => { setLocalMeta(m as unknown as Record<string, unknown>); setSaved(false); }}
            />
          )}
          {dist.platform === 'linkedin' && (
            <LinkedInEditor
              meta={localMeta as unknown as LinkedInMeta}
              onChange={(m) => { setLocalMeta(m as unknown as Record<string, unknown>); setSaved(false); }}
            />
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Action Buttons */}
          <div className="space-y-2 pt-4" style={{ borderTop: '1px solid var(--color-border-ghost)' }}>
            {/* Schedule Date Picker */}
            <div className="mb-2">
              <label className="flex items-center gap-1.5 mb-1">
                <Calendar className="w-3 h-3" style={{ color: 'var(--color-info)' }} />
                <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                  Schedule For
                </span>
              </label>
              <input
                type="datetime-local"
                value={scheduleDate ? scheduleDate.slice(0, 16) : ''}
                onChange={(e) => setScheduleDate(e.target.value ? new Date(e.target.value).toISOString() : '')}
                className="w-full px-3 py-2 rounded-md text-xs outline-none"
                style={{
                  background: 'var(--color-surface-component)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-ghost)',
                  colorScheme: 'dark',
                }}
              />
            </div>

            <motion.button
              onClick={handleApproveSchedule}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-[11px] font-medium"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dim))',
                color: '#000',
              }}
              whileHover={{ scale: 1.01, boxShadow: '0 0 16px var(--color-accent-glow)' }}
              whileTap={{ scale: 0.97 }}
            >
              <CheckCircle2 className="w-3 h-3" />
              {scheduleDate ? 'Approve & Schedule' : 'Approve'}
            </motion.button>

            <motion.button
              onClick={() => updateStatus(dist.id, 'archived')}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-[11px] font-medium"
              style={{
                background: 'var(--color-surface-component)',
                color: 'var(--color-text-tertiary)',
                border: '1px solid var(--color-border-ghost)',
              }}
              whileHover={{ borderColor: 'rgba(239,68,68,0.3)', color: 'var(--color-error)' }}
            >
              <Archive className="w-3 h-3" />
              Archive
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

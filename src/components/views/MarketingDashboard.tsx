import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Mail,
  AtSign,
  MessageCircle,
  BriefcaseBusiness,
  Sparkles,
  RefreshCw,
  ChevronRight,
  Calendar,
  Clock,
  CheckCircle2,
  Send,
  Archive,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { useMarketingStore } from '../../stores/marketingStore';
import { useLayoutStore } from '../../stores/layoutStore';
import {
  KANBAN_COLUMNS,
  PLATFORM_CONFIG,
  type ContentDistribution,
  type DistributionPlatform,
  type DistributionStatus,
} from '../../types/marketing.types';

// ─── Platform Icon Resolver ─────────────────────────────────────

function PlatformIcon({ platform, size = 14 }: { platform: DistributionPlatform; size?: number }) {
  const config = PLATFORM_CONFIG[platform];
  const props = { size, style: { color: config.color }, strokeWidth: 1.8 };
  switch (platform) {
    case 'newsletter': return <Mail {...props} />;
    case 'x_article':
    case 'x_thread':
    case 'x_quote': return <AtSign {...props} />;
    case 'reddit': return <MessageCircle {...props} />;
    case 'linkedin': return <BriefcaseBusiness {...props} />;
    default: return <FileText {...props} />;
  }
}

// ─── Stats Header ───────────────────────────────────────────────

function StatsHeader() {
  const { distributions } = useMarketingStore();

  const stats = [
    { label: 'Drafts', value: distributions.filter(d => d.status === 'draft').length, color: 'var(--color-text-tertiary)', icon: FileText },
    { label: 'Approved', value: distributions.filter(d => d.status === 'approved').length, color: 'var(--color-accent)', icon: CheckCircle2 },
    { label: 'Scheduled', value: distributions.filter(d => d.status === 'scheduled').length, color: 'var(--color-info)', icon: Calendar },
    { label: 'Published', value: distributions.filter(d => d.status === 'published').length, color: 'var(--color-success)', icon: TrendingUp },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 mb-6">
      {stats.map(s => (
        <motion.div
          key={s.label}
          className="rounded-xl p-4 flex items-center gap-3"
          style={{
            background: 'var(--color-surface-section)',
            border: '1px solid var(--color-border-ghost)',
          }}
          whileHover={{ borderColor: s.color, boxShadow: `0 0 16px ${s.color}15` }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${s.color}10`, border: `1px solid ${s.color}20` }}
          >
            <s.icon className="w-4 h-4" style={{ color: s.color }} />
          </div>
          <div>
            <motion.span
              className="text-xl font-semibold block"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
              key={s.value}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {s.value}
            </motion.span>
            <span className="text-[10px] uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)' }}>
              {s.label}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Platform Filter ────────────────────────────────────────────

const FILTER_OPTIONS: { id: DistributionPlatform | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'newsletter', label: 'Newsletter' },
  { id: 'x_thread', label: 'X' },
  { id: 'reddit', label: 'Reddit' },
  { id: 'linkedin', label: 'LinkedIn' },
];

function PlatformFilter() {
  const { filter, setFilter } = useMarketingStore();

  return (
    <div className="flex items-center gap-1 mb-5">
      {FILTER_OPTIONS.map(opt => {
        const isActive = filter.platform === opt.id;
        return (
          <motion.button
            key={opt.id}
            onClick={() => setFilter({ platform: opt.id })}
            className="px-3 py-1.5 rounded-md text-[11px] font-medium"
            style={{
              background: isActive ? 'var(--color-surface-interactive)' : 'transparent',
              color: isActive ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
              border: isActive ? '1px solid var(--color-border-active)' : '1px solid transparent',
              fontFamily: 'var(--font-mono)',
            }}
            whileHover={!isActive ? { backgroundColor: 'var(--color-surface-component)', color: 'var(--color-text-secondary)' } : undefined}
            whileTap={{ scale: 0.97 }}
          >
            {opt.label}
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── Kanban Card ────────────────────────────────────────────────

function KanbanCard({ dist, isOverlay }: { dist: ContentDistribution; isOverlay?: boolean }) {
  const { setSelectedId } = useMarketingStore();
  const { setActiveContextView } = useLayoutStore();
  const config = PLATFORM_CONFIG[dist.platform];
  const preview = dist.content_text?.slice(0, 100) + (dist.content_text?.length > 100 ? '…' : '');

  // @ts-expect-error - metadata shape varies per platform
  const metaTitle = dist.metadata?.subject_line ?? dist.metadata?.post_title ?? dist.metadata?.headline ?? '';

  const handleClick = () => {
    setSelectedId(dist.id);
    setActiveContextView('editor');
  };

  return (
    <motion.div
      onClick={isOverlay ? undefined : handleClick}
      className="rounded-lg p-3 cursor-pointer group"
      style={{
        background: 'var(--color-surface-component)',
        border: '1px solid var(--color-border-ghost)',
        opacity: isOverlay ? 0.9 : 1,
        boxShadow: isOverlay ? '0 12px 40px rgba(0,0,0,0.5)' : undefined,
      }}
      whileHover={!isOverlay ? {
        borderColor: config.color + '40',
        y: -1,
        boxShadow: `0 4px 16px ${config.color}10`,
      } : undefined}
      transition={{ duration: 0.15 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <PlatformIcon platform={dist.platform} size={12} />
        <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: config.color, fontFamily: 'var(--font-mono)' }}>
          {config.label}
        </span>
        <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-50 transition-opacity" style={{ color: 'var(--color-text-tertiary)' }} />
      </div>

      {/* Title/Preview */}
      {metaTitle && (
        <p className="text-xs font-medium mb-1 line-clamp-1" style={{ color: 'var(--color-text-primary)' }}>
          {metaTitle}
        </p>
      )}
      <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: 'var(--color-text-tertiary)' }}>
        {preview}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-2 mt-2.5 pt-2" style={{ borderTop: '1px solid var(--color-border-ghost)' }}>
        {dist.scheduled_for && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" style={{ color: 'var(--color-info)' }} />
            <span className="text-[9px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)' }}>
              {new Date(dist.scheduled_for).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
            </span>
          </div>
        )}
        {dist.source_type === 'social_native' && (
          <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(236,72,153,0.1)', color: '#ec4899', fontFamily: 'var(--font-mono)' }}>
            native
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Sortable Card Wrapper ──────────────────────────────────────

function SortableCard({ dist }: { dist: ContentDistribution }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: dist.id,
    data: { status: dist.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanCard dist={dist} />
    </div>
  );
}

// ─── Kanban Column ──────────────────────────────────────────────

function KanbanColumn({ status, label, color, items }: { status: string; label: string; color: string; items: ContentDistribution[] }) {
  const { setNodeRef } = useSortable({
    id: `column-${status}`,
    data: { type: 'column', status },
    disabled: true,
  });

  return (
    <div
      ref={setNodeRef}
      className="flex-1 min-w-0 flex flex-col rounded-xl overflow-hidden"
      style={{
        background: 'var(--color-surface-section)',
        border: '1px solid var(--color-border-ghost)',
      }}
    >
      {/* Column Header */}
      <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderBottom: '1px solid var(--color-border-ghost)' }}>
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)', color }}>
          {label}
        </span>
        <span
          className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md"
          style={{ background: 'var(--color-surface-component)', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}
        >
          {items.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 360px)' }}>
        <SortableContext items={items.map(d => d.id)} strategy={verticalListSortingStrategy}>
          {items.map(d => (
            <SortableCard key={d.id} dist={d} />
          ))}
        </SortableContext>

        {items.length === 0 && (
          <div className="py-8 text-center">
            <span className="text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>No items</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────

export function MarketingDashboard() {
  const { distributions, fetchDistributions, updateStatus, generateDrafts, loading } = useMarketingStore();
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  useEffect(() => {
    fetchDistributions();
  }, [fetchDistributions]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Determine target status
    let targetStatus: DistributionStatus | null = null;

    if (overId.startsWith('column-')) {
      targetStatus = overId.replace('column-', '') as DistributionStatus;
    } else {
      // Dropped on another card — find that card's status
      const overDist = distributions.find(d => d.id === overId);
      if (overDist) targetStatus = overDist.status;
    }

    if (!targetStatus) return;

    const activeDist = distributions.find(d => d.id === activeId);
    if (!activeDist || activeDist.status === targetStatus) return;

    // Only allow valid transitions
    const validTransitions: Record<string, string[]> = {
      draft: ['approved', 'archived'],
      approved: ['scheduled', 'draft', 'archived'],
      scheduled: ['approved', 'draft'],
      published: [], // no going back
      failed: ['draft'],
      archived: ['draft'],
    };

    if (validTransitions[activeDist.status]?.includes(targetStatus)) {
      updateStatus(activeId, targetStatus);
    }
  };

  const activeDist = activeDragId ? distributions.find(d => d.id === activeDragId) : null;

  // Group distributions by status
  const grouped: Record<string, ContentDistribution[]> = {};
  KANBAN_COLUMNS.forEach(col => { grouped[col.id] = []; });
  distributions.forEach(d => {
    if (grouped[d.status]) grouped[d.status].push(d);
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-xl font-semibold tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
            >
              Marketing Pipeline
            </h1>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
              Content distribution across Newsletter, X, Reddit, LinkedIn — powered by ARES Research Hub.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => fetchDistributions()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium"
              style={{
                background: 'var(--color-surface-component)',
                color: 'var(--color-text-tertiary)',
                border: '1px solid var(--color-border-ghost)',
              }}
              whileHover={{ borderColor: 'var(--color-border-active)', color: 'var(--color-text-secondary)' }}
              whileTap={{ scale: 0.97 }}
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>
            <motion.button
              onClick={() => generateDrafts()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dim))',
                color: '#000',
                border: 'none',
              }}
              whileHover={{ scale: 1.02, boxShadow: '0 0 16px var(--color-accent-glow)' }}
              whileTap={{ scale: 0.97 }}
            >
              <Sparkles className="w-3 h-3" />
              Generate Drafts
            </motion.button>
          </div>
        </div>

        {/* Stats */}
        <StatsHeader />

        {/* Filter */}
        <PlatformFilter />

        {/* Kanban Board */}
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-4 gap-3" style={{ minHeight: 400 }}>
            {KANBAN_COLUMNS.map(col => (
              <KanbanColumn
                key={col.id}
                status={col.id}
                label={col.label}
                color={col.color}
                items={grouped[col.id] ?? []}
              />
            ))}
          </div>

          <DragOverlay>
            {activeDist && <KanbanCard dist={activeDist} isOverlay />}
          </DragOverlay>
        </DndContext>

        {/* Bottom actions */}
        <div className="flex items-center gap-3 mt-6 pb-4">
          <motion.button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium"
            style={{
              background: 'var(--color-surface-component)',
              color: 'var(--color-text-tertiary)',
              border: '1px solid var(--color-border-ghost)',
            }}
            whileHover={{ borderColor: 'rgba(16,185,129,0.3)', color: 'var(--color-success)' }}
          >
            <Send className="w-3 h-3" />
            Publish All Approved
          </motion.button>
          <motion.button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium"
            style={{
              background: 'var(--color-surface-component)',
              color: 'var(--color-text-tertiary)',
              border: '1px solid var(--color-border-ghost)',
            }}
            whileHover={{ borderColor: 'rgba(239,68,68,0.3)', color: 'var(--color-error)' }}
          >
            <Archive className="w-3 h-3" />
            Archive All Failed
          </motion.button>
        </div>
      </div>
    </div>
  );
}

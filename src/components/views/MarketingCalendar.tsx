import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { useMarketingStore } from '../../stores/marketingStore';
import { useLayoutStore } from '../../stores/layoutStore';
import {
  PLATFORM_CONFIG,
  type ContentDistribution,
  type DistributionPlatform,
} from '../../types/marketing.types';

// ─── Date Helpers ───────────────────────────────────────────────

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  // 0 = Sunday, convert to Mon-start: 0=Mon, 6=Sun
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ─── Calendar Cell ──────────────────────────────────────────────

function CalendarCell({ date, isToday, isCurrentMonth, posts }: {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
  posts: ContentDistribution[];
}) {
  const { setSelectedId } = useMarketingStore();
  const { setActiveContextView } = useLayoutStore();

  const handlePostClick = (id: string) => {
    setSelectedId(id);
    setActiveContextView('editor');
  };

  return (
    <div
      className="min-h-[100px] p-1.5 rounded-lg"
      style={{
        background: isToday ? 'rgba(245,158,11,0.04)' : 'var(--color-surface-section)',
        border: isToday ? '1px solid var(--color-border-active)' : '1px solid var(--color-border-ghost)',
        opacity: isCurrentMonth ? 1 : 0.35,
      }}
    >
      {/* Day Number */}
      <div className="flex items-center justify-between mb-1">
        <span
          className="text-[11px] font-medium"
          style={{
            color: isToday ? 'var(--color-accent)' : 'var(--color-text-secondary)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {date.getDate()}
        </span>
        {posts.length > 0 && (
          <span
            className="text-[8px] px-1 rounded"
            style={{ background: 'var(--color-surface-interactive)', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}
          >
            {posts.length}
          </span>
        )}
      </div>

      {/* Post Chips */}
      <div className="space-y-1">
        {posts.slice(0, 3).map((post) => {
          const config = PLATFORM_CONFIG[post.platform];
          return (
            <motion.div
              key={post.id}
              className="px-1.5 py-0.5 rounded cursor-pointer truncate"
              style={{
                background: `${config.color}15`,
                border: `1px solid ${config.color}25`,
              }}
              whileHover={{
                borderColor: `${config.color}60`,
                boxShadow: `0 0 8px ${config.color}15`,
                scale: 1.02,
              }}
              onClick={() => handlePostClick(post.id)}
              title={post.content_text?.slice(0, 100)}
            >
              <span
                className="text-[9px] font-medium truncate block"
                style={{ color: config.color, fontFamily: 'var(--font-mono)' }}
              >
                {config.label}
              </span>
            </motion.div>
          );
        })}
        {posts.length > 3 && (
          <span className="text-[8px] block text-center" style={{ color: 'var(--color-text-tertiary)' }}>
            +{posts.length - 3} more
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Main Calendar ──────────────────────────────────────────────

export function MarketingCalendar() {
  const { distributions, fetchDistributions } = useMarketingStore();

  useEffect(() => {
    fetchDistributions();
  }, [fetchDistributions]);

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const goToPrev = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNext = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const daysInPrevMonth = getDaysInMonth(currentYear, currentMonth - 1);

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(currentYear, currentMonth - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        date: new Date(currentYear, currentMonth, d),
        isCurrentMonth: true,
      });
    }

    // Next month padding (fill to 42 = 6 weeks)
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({
        date: new Date(currentYear, currentMonth + 1, d),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Group scheduled/published posts by date key
  const postsByDate = useMemo(() => {
    const map = new Map<string, ContentDistribution[]>();
    distributions
      .filter((d) => d.scheduled_for && ['scheduled', 'approved', 'published'].includes(d.status))
      .forEach((d) => {
        const dateKey = new Date(d.scheduled_for!).toISOString().slice(0, 10);
        if (!map.has(dateKey)) map.set(dateKey, []);
        map.get(dateKey)!.push(d);
      });
    return map;
  }, [distributions]);

  // Stats for sidebar
  const scheduledThisMonth = distributions.filter((d) => {
    if (!d.scheduled_for || d.status === 'archived') return false;
    const scheduled = new Date(d.scheduled_for);
    return scheduled.getFullYear() === currentYear && scheduled.getMonth() === currentMonth;
  });

  const platformCounts = scheduledThisMonth.reduce<Partial<Record<DistributionPlatform, number>>>((acc, d) => {
    acc[d.platform] = (acc[d.platform] ?? 0) + 1;
    return acc;
  }, {});

  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <h1
              className="text-xl font-semibold tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
            >
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h1>
            <div className="flex items-center gap-1">
              <motion.button
                onClick={goToPrev}
                className="w-7 h-7 rounded-md flex items-center justify-center"
                style={{ background: 'var(--color-surface-component)', border: '1px solid var(--color-border-ghost)' }}
                whileHover={{ borderColor: 'var(--color-border-active)' }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft className="w-3.5 h-3.5" style={{ color: 'var(--color-text-tertiary)' }} />
              </motion.button>
              <motion.button
                onClick={goToToday}
                className="px-2.5 h-7 rounded-md text-[10px] font-medium uppercase tracking-wider"
                style={{
                  background: 'var(--color-surface-component)',
                  color: 'var(--color-text-tertiary)',
                  border: '1px solid var(--color-border-ghost)',
                  fontFamily: 'var(--font-mono)',
                }}
                whileHover={{ borderColor: 'var(--color-border-active)', color: 'var(--color-accent)' }}
                whileTap={{ scale: 0.95 }}
              >
                Today
              </motion.button>
              <motion.button
                onClick={goToNext}
                className="w-7 h-7 rounded-md flex items-center justify-center"
                style={{ background: 'var(--color-surface-component)', border: '1px solid var(--color-border-ghost)' }}
                whileHover={{ borderColor: 'var(--color-border-active)' }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--color-text-tertiary)' }} />
              </motion.button>
            </div>
          </div>

          {/* Month Summary */}
          <div className="flex items-center gap-3">
            <Clock className="w-3.5 h-3.5" style={{ color: 'var(--color-text-tertiary)' }} />
            <span className="text-[11px]" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              {scheduledThisMonth.length} scheduled
            </span>
            <div className="flex items-center gap-1.5">
              {Object.entries(platformCounts).map(([platform, count]) => {
                const config = PLATFORM_CONFIG[platform as DistributionPlatform];
                return (
                  <span
                    key={platform}
                    className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                    style={{ background: `${config.color}12`, color: config.color, fontFamily: 'var(--font-mono)' }}
                  >
                    {config.label}: {count}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Day Labels */}
        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
          {DAY_LABELS.map((day) => (
            <div key={day} className="text-center py-1.5">
              <span
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}
              >
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((item, i) => {
            const dateKey = item.date.toISOString().slice(0, 10);
            const posts = postsByDate.get(dateKey) ?? [];

            return (
              <CalendarCell
                key={i}
                date={item.date}
                isToday={isToday(item.date)}
                isCurrentMonth={item.isCurrentMonth}
                posts={posts}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

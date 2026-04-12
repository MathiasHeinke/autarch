/**
 * ARES Preset — Marketing + Longevity-specific modules.
 * 
 * Extends vanilla with:
 * - Marketing Dashboard (Content Pipeline, Calendar, Draft Editor)
 * 
 * This preset is for the ARES Bio.OS team.
 */

import { createElement, lazy, Suspense } from 'react';
import { FolderTree, Search, MessageSquare } from 'lucide-react';
import type { PresetConfig, ModuleDefinition } from './types';

// Lazy-load marketing views (they're big and only the ARES preset needs them)
const MarketingDashboard = lazy(() => 
  import('../components/views/MarketingDashboard').then(m => ({ default: m.MarketingDashboard }))
);
const MarketingCalendar = lazy(() => 
  import('../components/views/MarketingCalendar').then(m => ({ default: m.MarketingCalendar }))
);
const DraftEditor = lazy(() => 
  import('../components/views/DraftEditor').then(m => ({ default: m.DraftEditor }))
);

function LazyWrap(Component: React.LazyExoticComponent<React.ComponentType>) {
  return createElement(
    Suspense,
    { fallback: createElement('div', { 
      style: { 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100%', color: 'var(--color-text-tertiary)', fontSize: '12px',
        fontFamily: 'var(--font-mono)',
      } 
    }, 'Loading...') },
    createElement(Component)
  );
}

// ─── Marketing Module ───────────────────────────────────────────

const marketingModule: ModuleDefinition = {
  id: 'marketing',
  name: 'Marketing',
  tab: {
    id: 'marketing',
    label: 'Marketing',
    icon: Search,  // Will be overridden by TopNav's icon mapping
  },
  contextItems: [
    { icon: FolderTree, id: 'pipeline', label: 'Content Pipeline' },
    { icon: Search, id: 'calendar', label: 'Calendar View' },
    { icon: MessageSquare, id: 'editor', label: 'Draft Editor' },
  ],
  resolveView: (contextViewId: string) => {
    switch (contextViewId) {
      case 'calendar': return LazyWrap(MarketingCalendar);
      case 'editor': return LazyWrap(DraftEditor);
      default: return LazyWrap(MarketingDashboard);
    }
  },
};

// ─── ARES Preset ────────────────────────────────────────────────

export const aresPreset: PresetConfig = {
  name: 'ares',
  modules: [marketingModule],
  hermesCloneUrl: 'https://github.com/ares-os/hermes-agent.git',
  branding: {
    appName: 'AUTARCH',
    footerLabel: 'autarch v0.1.0',
  },
};

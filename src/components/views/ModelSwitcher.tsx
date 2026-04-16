import { ChevronDown, Cpu, Zap, Brain, Globe } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import { useHermesStore } from '../../stores/hermesStore';
import { checkHermesHealth } from '../../services/hermesClient';

// ─── Model Definitions ──────────────────────────────────────────
// Static fallback list — used when Hermes is offline or /v1/models unavailable.
// When Hermes is online, this merges with dynamically fetched models.

interface ModelEntry {
  id: string;
  name: string;
  provider: string;
  tier: 'fast' | 'deep' | 'lite';
}

const PROVIDER_ICONS: Record<string, typeof Cpu> = {
  'xAI': Zap,
  'Anthropic': Brain,
  'Google': Globe,
  'OpenAI': Cpu,
};

const STATIC_MODELS: ModelEntry[] = [
  // ── xAI ──
  { id: 'openrouter/x-ai/grok-4.1', name: 'Grok 4.1', provider: 'xAI', tier: 'fast' },
  { id: 'openrouter/x-ai/grok-4.2', name: 'Grok 4.2', provider: 'xAI', tier: 'deep' },
  // ── Anthropic ──
  { id: 'openrouter/anthropic/claude-4.7-sonnet', name: 'Claude 4.7 Sonnet', provider: 'Anthropic', tier: 'fast' },
  { id: 'openrouter/anthropic/claude-4.7-opus', name: 'Claude 4.7 Opus', provider: 'Anthropic', tier: 'deep' },
  // ── Google ──
  { id: 'openrouter/google/gemini-3-flash-preview', name: 'Gemini 3 Flash', provider: 'Google', tier: 'fast' },
  { id: 'openrouter/google/gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', provider: 'Google', tier: 'deep' },
];

const TIER_BADGE: Record<ModelEntry['tier'], { label: string; color: string }> = {
  fast: { label: 'FAST', color: 'bg-emerald-500/10 text-emerald-400' },
  deep: { label: 'DEEP', color: 'bg-amber-500/10 text-amber-400' },
  lite: { label: 'LITE', color: 'bg-slate-500/10 text-slate-400' },
};

// ─── Component ──────────────────────────────────────────────────

interface ModelSwitcherProps {
  className?: string;
}

export function ModelSwitcher({ className }: ModelSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [models, setModels] = useState<ModelEntry[]>(STATIC_MODELS);
  const { activeModel, setActiveModel } = useHermesStore();
  const ref = useRef<HTMLDivElement>(null);

  // Resolve active model — fallback to first in list
  const active = models.find(m => m.id === activeModel) || models[0];

  // Click outside → close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch dynamic models from Hermes /v1/models when dropdown opens
  const fetchModels = useCallback(async () => {
    try {
      const status = await checkHermesHealth();
      if (!status.online) return;

      const res = await fetch(`${status.url}/v1/models`);
      if (!res.ok) return;

      const data = await res.json();
      if (!data?.data?.length) return;

      // Merge: dynamic models from Hermes + static fallback for unknown ones
      const dynamicModels: ModelEntry[] = data.data.map((m: { id: string }) => {
        const existing = STATIC_MODELS.find(s => s.id === m.id);
        if (existing) return existing;

        // Parse provider from model ID (e.g. "openrouter/anthropic/claude-4" → "Anthropic")
        const parts = m.id.split('/');
        const provider = parts.length >= 2 ? capitalize(parts[parts.length - 2]) : 'Custom';
        const name = parts[parts.length - 1] || m.id;
        return { id: m.id, name, provider, tier: 'fast' as const };
      });

      setModels(dynamicModels.length > 0 ? dynamicModels : STATIC_MODELS);
    } catch {
      // Hermes offline — keep static models
    }
  }, []);

  // Group models by provider
  const grouped = models.reduce<Record<string, ModelEntry[]>>((acc, m) => {
    (acc[m.provider] ??= []).push(m);
    return acc;
  }, {});

  return (
    <div className={clsx("relative", className)} ref={ref}>
      <button 
        onClick={() => { setOpen(!open); if (!open) fetchModels(); }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-white/5 hover:bg-white/5 transition-colors bg-[#121214]/50"
      >
        <Cpu size={14} className="text-emerald-400" />
        <span className="text-xs font-medium text-slate-300">{active.name}</span>
        <ChevronDown size={14} className={clsx("text-slate-500 ml-1 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-[#121214] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden">
          {Object.entries(grouped).map(([provider, providerModels]) => {
            const Icon = PROVIDER_ICONS[provider] || Cpu;
            return (
              <div key={provider}>
                {/* Provider header */}
                <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/5">
                  <Icon size={10} className="text-slate-500" />
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{provider}</span>
                </div>
                {/* Models */}
                {providerModels.map(m => {
                  const badge = TIER_BADGE[m.tier];
                  return (
                    <button 
                      key={m.id}
                      onClick={() => { setActiveModel(m.id); setOpen(false); }}
                      className={clsx(
                        "w-full text-left px-3 py-2 flex items-center justify-between hover:bg-white/5 transition-colors",
                        m.id === active.id && "bg-white/5"
                      )}
                    >
                      <span className={clsx("text-xs font-medium", m.id === active.id ? "text-emerald-400" : "text-slate-200")}>
                        {m.name}
                      </span>
                      <span className={clsx("text-[9px] px-1.5 py-0.5 rounded uppercase font-semibold", badge.color)}>
                        {badge.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

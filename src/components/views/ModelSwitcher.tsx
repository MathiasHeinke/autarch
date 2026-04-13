import { ChevronDown, Cpu } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

const MODELS = [
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', fast: true },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', fast: false },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', fast: true },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', fast: false },
];

interface ModelSwitcherProps {
  className?: string;
}

export function ModelSwitcher({ className }: ModelSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(MODELS[0]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={clsx("relative", className)} ref={ref}>
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-white/5 hover:bg-white/5 transition-colors bg-[#121214]/50"
      >
        <Cpu size={14} className="text-emerald-400" />
        <span className="text-xs font-medium text-slate-300">{active.name}</span>
        <ChevronDown size={14} className="text-slate-500 ml-1" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-[#121214] border border-white/10 rounded-md shadow-2xl z-50 overflow-hidden py-1">
          {MODELS.map(m => (
            <button 
              key={m.id}
              onClick={() => { setActive(m); setOpen(false); }}
              className={clsx(
                "w-full text-left px-3 py-2 flex flex-col gap-1 hover:bg-white/5 transition-colors",
                m.id === active.id && "bg-white/5"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={clsx("text-xs font-medium", m.id === active.id ? "text-emerald-400" : "text-slate-200")}>{m.name}</span>
                {m.fast && <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded uppercase font-semibold">fast</span>}
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">{m.provider}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

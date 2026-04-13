import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Check, ArrowRight, Loader2, Code } from 'lucide-react';
import { requestInlineEdit } from '../../services/hermesBridge';

interface AgentInlineEditOverlayProps {
  position: { top: number; left: number };
  selectedText: string;
  activeFilePath: string;
  onApply: (newText: string) => void;
  onCancel: () => void;
  editorContainerRef: React.RefObject<HTMLDivElement | null>;
}

export function AgentInlineEditOverlay({
  position,
  selectedText,
  activeFilePath,
  onApply,
  onCancel,
  editorContainerRef,
}: AgentInlineEditOverlayProps) {
  const [mode, setMode] = useState<'button' | 'prompting' | 'generating' | 'preview'>('button');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Compute boundaries so the widget doesn't fall off-screen
  const [adjustedPos, setAdjustedPos] = useState(position);

  useEffect(() => {
    if (editorContainerRef.current) {
      const rect = editorContainerRef.current.getBoundingClientRect();
      let newTop = position.top;
      let newLeft = position.left;

      // Basic boundary checking (widget is about ~300px wide, ~100px tall)
      if (newTop > rect.height - 150) newTop = rect.height - 150;
      if (newLeft > rect.width - 320) newLeft = rect.width - 320;
      
      setAdjustedPos({ top: newTop, left: newLeft });
    } else {
      setAdjustedPos(position);
    }
  }, [position, editorContainerRef]);

  useEffect(() => {
    if (mode === 'prompting' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [mode]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setMode('generating');
    try {
      const generated = await requestInlineEdit(prompt, selectedText, activeFilePath);
      setResult(generated);
      setMode('preview');
    } catch (e) {
      console.error("Inline edit failed:", e);
      setMode('prompting'); // Go back on error
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div
      className="absolute z-50 transition-all duration-200 ease-out"
      style={{ top: adjustedPos.top, left: adjustedPos.left }}
    >
      <AnimatePresence mode="wait">
        {mode === 'button' && (
          <motion.button
            key="btn"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setMode('prompting')}
            className="flex items-center justify-center p-2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-lg shadow-emerald-500/20 backdrop-blur-md hover:bg-emerald-500/30 transition-colors"
            title="Edit with Autarch"
          >
            <Sparkles size={16} />
          </motion.button>
        )}

        {mode === 'prompting' && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="flex flex-col gap-2 p-3 bg-[#18181B] border border-white/10 rounded-xl shadow-2xl w-80 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium px-1">
              <Sparkles size={12} className="text-emerald-400" />
              Agent Inline Edit
            </div>
            <textarea
              ref={inputRef as any}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="How should I change this?"
              className="bg-[#09090B] border border-white/5 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 min-h-[60px] resize-none"
            />
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] text-slate-500">Press Esc to cancel</span>
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-md text-xs font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-500/20"
              >
                Let's Build <ArrowRight size={12} />
              </button>
            </div>
          </motion.div>
        )}

        {mode === 'generating' && (
          <motion.div
            key="gen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 p-4 bg-[#18181B] border border-emerald-500/30 rounded-xl shadow-2xl backdrop-blur-xl"
          >
            <Loader2 size={16} className="text-emerald-400 animate-spin" />
            <span className="text-sm text-slate-300">Hermes is thinking...</span>
          </motion.div>
        )}

        {mode === 'preview' && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="flex flex-col overflow-hidden bg-[#18181B] border border-white/10 rounded-xl shadow-2xl w-[400px] max-h-[300px] backdrop-blur-xl"
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-white/5">
              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                <Code size={14} className="text-emerald-400" />
                Diff Preview
              </div>
              <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 bg-[#09090B]">
              <pre className="text-xs font-mono text-emerald-300/80 whitespace-pre-wrap">
                {result}
              </pre>
            </div>
            
            <div className="flex gap-2 p-3 border-t border-white/5 bg-[#18181B]">
              <button
                onClick={onCancel}
                className="flex-1 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => onApply(result)}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
              >
                <Check size={14} /> Accept
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

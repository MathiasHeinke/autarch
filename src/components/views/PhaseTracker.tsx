import { motion, AnimatePresence } from 'framer-motion';
import { useExecutionPlanStore } from '../../stores/executionPlanStore';
import { 
  Play, 
  CheckCircle2, 
  XOctagon, 
  Loader2, 
  ShieldAlert, 
  ShieldCheck, 
  BrainCircuit, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { useState } from 'react';
import type { PhaseDefinition, PhaseResult, GateResult } from '../../types/executionPlan.types';
import ReactMarkdown from 'react-markdown';

export function PhaseTracker() {
  const { activePlan, activeState, activePhaseId, streamingOutput, cancelPlan, retryPhase } = useExecutionPlanStore();

  if (!activePlan || !activeState) return null;

  return (
    <div className="flex flex-col w-full h-full bg-[#050505] text-white">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#0A0A0A] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
            <BrainCircuit className="w-4 h-4 text-white/70" />
          </div>
          <div>
            <h2 className="text-sm font-medium tracking-wide">Execution Engine</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${
                activePlan.status === 'running' ? 'bg-emerald-500 animate-pulse' :
                activePlan.status === 'completed' ? 'bg-blue-500' :
                activePlan.status === 'failed' ? 'bg-red-500' : 'bg-white/20'
              }`} />
              <span className="text-xs text-white/50 lowercase tracking-wider">{activePlan.status}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
           {activePlan.status === 'running' && (
             <button 
                onClick={cancelPlan}
                className="px-3 py-1.5 rounded-md bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors border border-red-500/20"
             >
                Abort Plan
             </button>
           )}
           {activePlan.status === 'failed' && (
             <button 
                onClick={retryPhase}
                className="px-3 py-1.5 rounded-md bg-amber-500/10 text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-colors border border-amber-500/20"
             >
                Retry Active Phase
             </button>
           )}
        </div>
      </div>

      {/* ─── Phases List ─── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activePlan.phases.map((phase, idx) => {
          const result = activeState.results[phase.id];
          const isActive = activePhaseId === phase.id;
          return (
            <PhaseCard 
               key={phase.id} 
               phase={phase} 
               result={result} 
               isActive={isActive}
               streamingOutput={isActive ? streamingOutput : undefined}
               index={idx}
            />
          );
        })}
      </div>
    </div>
  );
}

function PhaseCard({ 
  phase, 
  result, 
  isActive, 
  streamingOutput,
  index 
}: { 
  phase: PhaseDefinition; 
  result?: PhaseResult; 
  isActive: boolean;
  streamingOutput?: string;
  index: number;
}) {
  const [expanded, setExpanded] = useState(true);
  
  const status = result?.status || 'pending';
  
  const getStatusIcon = () => {
    switch(status) {
      case 'running': return <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />;
      case 'gate-running': return <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />;
      case 'passed': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'gate-failed':
      case 'failed': return <XOctagon className="w-4 h-4 text-red-500" />;
      case 'skipped': return <Play className="w-4 h-4 text-white/30" />;
      default: return <Play className="w-4 h-4 text-white/30" />;
    }
  };

  const getBorderColor = () => {
    if (isActive) return 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
    switch(status) {
      case 'passed': return 'border-white/10';
      case 'failed':
      case 'gate-failed': return 'border-red-500/30';
      case 'skipped': return 'border-white/5 opacity-50';
      default: return 'border-white/5';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`rounded-xl border bg-[#0F0F0F] overflow-hidden transition-all duration-300 ${getBorderColor()}`}
    >
      {/* ─── Card Header ─── */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/[0.02]"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-[#151515] flex items-center justify-center border border-white/5">
            {getStatusIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-xs font-mono text-white/40">[{index + 1}]</span>
               <h3 className="text-sm font-medium text-white/90">{phase.title}</h3>
            </div>
            <div className="text-xs text-white/40 mt-0.5 flex items-center gap-2">
              <span className="bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                {phase.persona}
              </span>
              <span>{phase.description}</span>
            </div>
          </div>
        </div>
        <button className="text-white/30 hover:text-white/70 transition-colors">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* ─── Card Body (Animated) ─── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5"
          >
            <div className="p-4 space-y-4">
               {/* Streaming / Output Area */}
               <div className="text-sm text-white/70 font-mono bg-[#050505] p-3 rounded-md border border-white/5 max-h-[300px] overflow-y-auto w-full prose prose-invert prose-sm">
                 {isActive && streamingOutput ? (
                   <ReactMarkdown>{streamingOutput}</ReactMarkdown>
                 ) : result?.output ? (
                   <ReactMarkdown>{result.output}</ReactMarkdown>
                 ) : (
                   <span className="text-white/30 italic">No output yet...</span>
                 )}
                 {isActive && <motion.span animate={{ opacity: [0, 1] }} transition={{ repeat: Infinity }} className="inline-block w-1.5 h-3 bg-amber-500 ml-1" />}
               </div>

               {/* Gate Evaluation Block */}
               {phase.gateCriteria.length > 0 && result?.gateResult && (
                 <GateEvaluationView result={result.gateResult} retryCount={result.retryCount} />
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function GateEvaluationView({ result, retryCount }: { result: GateResult; retryCount: number }) {
  return (
    <div className={`rounded-lg border p-3 ${result.passed ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
       <div className="flex items-center gap-2 mb-3">
         {result.passed ? <ShieldCheck className="w-4 h-4 text-emerald-500" /> : <ShieldAlert className="w-4 h-4 text-red-500" />}
         <span className={`text-xs font-bold uppercase tracking-wider ${result.passed ? 'text-emerald-500' : 'text-red-500'}`}>
           Gate {result.passed ? 'Passed' : 'Failed'}
         </span>
         <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded font-mono uppercase ml-auto">
           EVAL: {result.persona}
         </span>
         {retryCount > 0 && (
           <span className="text-[10px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded font-mono uppercase">
             Retrys: {retryCount}
           </span>
         )}
       </div>
       
       <p className="text-xs text-white/70 mb-3">{result.summary}</p>

       <div className="space-y-1.5">
         {result.criteria.map((c, i) => (
           <div key={i} className="flex gap-2 text-xs">
             <div className="mt-0.5 shrink-0">
               {c.passed ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <XOctagon className="w-3 h-3 text-red-500" />}
             </div>
             <div>
               <div className="text-white/80">{c.description}</div>
               {!c.passed && c.evidence && <div className="text-red-400/80 mt-0.5">{c.evidence}</div>}
             </div>
           </div>
         ))}
       </div>
    </div>
  );
}

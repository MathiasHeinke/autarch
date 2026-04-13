import { Wrench, TerminalSquare, Power, Settings2 } from 'lucide-react';

export function SkillsBrowser() {
  return (
    <div className="flex flex-col h-full bg-[#0A0A0C]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-blue-500/10 flex items-center justify-center">
            <Wrench className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-slate-200">Skills Registry</h2>
            <p className="text-xs text-slate-500">MCP toolkits, shell abilities, and capability vectors.</p>
          </div>
        </div>
      </div>

      {/* Content Mock */}
      <div className="flex-1 p-6 overflow-y-auto">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
           <div className="p-4 bg-[#121214] border border-white/5 rounded-lg hover:border-blue-500/30 transition-colors flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <TerminalSquare size={16} className="text-blue-400" />
                <h3 className="text-sm font-medium text-slate-200">git_commit</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4 flex-1">
                Stage, commit, and optionally push changes with conventional commit parsing logic.
              </p>
              <div className="flex items-center gap-2 mt-auto">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Enabled</span>
              </div>
           </div>
           
           <div className="p-4 bg-[#121214] border border-white/5 rounded-lg hover:border-blue-500/30 transition-colors flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Settings2 size={16} className="text-emerald-400" />
                <h3 className="text-sm font-medium text-slate-200">mcp_query</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4 flex-1">
                Executes complex cipher queries against the active GitNexus knowledge graph.
              </p>
              <div className="flex items-center gap-2 mt-auto">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Enabled</span>
              </div>
           </div>

           <div className="p-4 bg-[#121214] border border-white/5 rounded-lg opacity-50 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Power size={16} className="text-slate-500" />
                <h3 className="text-sm font-medium text-slate-500">aws_deploy</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4 flex-1">
                Pipeline invocation for Amazon Web Services multi-region deployment.
              </p>
              <div className="flex items-center gap-2 mt-auto">
                <div className="w-2 h-2 rounded-full bg-slate-600" />
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Standby</span>
              </div>
           </div>
         </div>
      </div>
    </div>
  );
}

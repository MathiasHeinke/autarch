import { Database, Search } from 'lucide-react';

export function MemoryPanel() {
  return (
    <div className="flex flex-col h-full bg-[#0A0A0C]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-purple-500/10 flex items-center justify-center">
            <Database className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-slate-200">Memory Bank</h2>
            <p className="text-xs text-slate-500">Autonomous episodic and semantic context cache.</p>
          </div>
        </div>
      </div>

      {/* Content Mock */}
      <div className="flex-1 p-6 overflow-y-auto">
         <div className="max-w-3xl">
           <div className="flex items-center gap-2 mb-6 px-3 py-2 bg-[#121214] border border-white/10 rounded-md shadow-inner">
             <Search size={16} className="text-slate-400" />
             <input 
               type="text" 
               placeholder="Search memories, facts, and embeddings..." 
               className="bg-transparent border-none outline-none text-sm text-slate-300 w-full placeholder:text-slate-600" 
             />
           </div>

           <div className="space-y-4">
             {/* Mock Memories */}
             <div className="p-4 bg-[#121214] border border-white/5 rounded-lg flex flex-col gap-3 group hover:border-white/10 transition-colors">
               <div className="flex items-center justify-between">
                 <span className="text-xs font-semibold text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded tracking-wide uppercase">Semantic Fact</span>
                 <span className="text-xs text-slate-500 font-mono">2 mins ago</span>
               </div>
               <p className="text-sm text-slate-300 leading-relaxed">
                 User prefers TailwindCSS over Vanilla CSS for small projects, but strictly requested standard architecture for ARES marketing to ensure component isolation.
               </p>
             </div>
             
             <div className="p-4 bg-[#121214] border border-white/5 rounded-lg flex flex-col gap-3 group hover:border-white/10 transition-colors">
               <div className="flex items-center justify-between">
                 <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded tracking-wide uppercase">Episodic Trace</span>
                 <span className="text-xs text-slate-500 font-mono">1 hour ago</span>
               </div>
               <p className="text-sm text-slate-300 leading-relaxed">
                 Refactored <code className="text-emerald-400 bg-emerald-400/10 px-1 rounded">layoutStore.ts</code> to use persistence middleware. Panel sizes are now strictly cached in localStorage.
               </p>
             </div>
           </div>
         </div>
      </div>
    </div>
  );
}

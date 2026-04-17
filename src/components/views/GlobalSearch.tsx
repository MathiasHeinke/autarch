import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, CaseSensitive, Regex, WholeWord, FileText, ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import clsx from 'clsx';

// ─── Types ──────────────────────────────────────────────────

interface LineMatch {
  line: number;
  content: string;
}

interface FileResult {
  filePath: string;
  fileName: string;
  matches: LineMatch[];
}

// ─── Helpers ────────────────────────────────────────────────

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/**
 * Parse grep output lines like:
 *   /path/to/file.ts:42:  const x = 'hello';
 * into grouped FileResult[]
 */
function parseGrepOutput(raw: string, workspaceRoot: string): FileResult[] {
  const lines = raw.split('\n').filter(Boolean);
  const grouped = new Map<string, LineMatch[]>();

  for (const line of lines) {
    // grep -n format: filepath:lineNumber:content
    const firstColon = line.indexOf(':');
    if (firstColon === -1) continue;
    const secondColon = line.indexOf(':', firstColon + 1);
    if (secondColon === -1) continue;

    const filePath = line.substring(0, firstColon);
    const lineNum = parseInt(line.substring(firstColon + 1, secondColon), 10);
    const content = line.substring(secondColon + 1).trim();

    if (isNaN(lineNum)) continue;

    if (!grouped.has(filePath)) {
      grouped.set(filePath, []);
    }
    grouped.get(filePath)!.push({ line: lineNum, content });
  }

  const results: FileResult[] = [];
  for (const [filePath, matches] of grouped) {
    const relativePath = filePath.startsWith(workspaceRoot)
      ? filePath.substring(workspaceRoot.length + 1)
      : filePath;
    results.push({
      filePath,
      fileName: relativePath,
      matches: matches.slice(0, 50), // cap per file
    });
  }

  return results;
}

/**
 * Browser-mode fallback: search through editorStore's fileTree using readTextFile.
 */
async function browserSearch(query: string, matchCase: boolean): Promise<FileResult[]> {
  const store = useEditorStore.getState();
  const { fileTree, workspaceRoot } = store;
  if (!workspaceRoot || !fileTree.length) return [];

  const results: FileResult[] = [];
  const searchQuery = matchCase ? query : query.toLowerCase();

  // Flatten file tree
  function flattenFiles(nodes: typeof fileTree): string[] {
    const paths: string[] = [];
    for (const node of nodes) {
      if (node.type === 'file') {
        paths.push(node.path);
      } else if (node.children) {
        paths.push(...flattenFiles(node.children));
      }
    }
    return paths;
  }

  const allFiles = flattenFiles(fileTree).slice(0, 500); // cap at 500

  for (const filePath of allFiles) {
    try {
      const { readTextFile } = await import('@tauri-apps/plugin-fs');
      const content = await readTextFile(filePath);
      const lines = content.split('\n');
      const matches: LineMatch[] = [];

      for (let i = 0; i < lines.length; i++) {
        const lineText = matchCase ? lines[i] : lines[i].toLowerCase();
        if (lineText.includes(searchQuery)) {
          matches.push({ line: i + 1, content: lines[i].trim() });
          if (matches.length >= 20) break; // cap per file
        }
      }

      if (matches.length > 0) {
        const relativePath = filePath.startsWith(workspaceRoot)
          ? filePath.substring(workspaceRoot.length + 1)
          : filePath;
        results.push({ filePath, fileName: relativePath, matches });
      }
    } catch {
      // skip unreadable files
    }

    if (results.length >= 100) break; // cap total files
  }

  return results;
}

// ─── Tauri grep-based search ────────────────────────────────

async function tauriSearch(
  query: string,
  workspaceRoot: string,
  matchCase: boolean,
  useRegex: boolean,
  signal: AbortSignal,
): Promise<FileResult[]> {
  const { Command } = await import('@tauri-apps/plugin-shell');

  const args: string[] = ['-rnI', '--color=never'];

  // File type includes
  args.push(
    '--include=*.ts', '--include=*.tsx', '--include=*.js', '--include=*.jsx',
    '--include=*.json', '--include=*.md', '--include=*.css', '--include=*.html',
    '--include=*.yaml', '--include=*.yml', '--include=*.toml', '--include=*.rs',
    '--include=*.swift', '--include=*.py',
  );

  // Exclude directories
  args.push(
    '--exclude-dir=node_modules', '--exclude-dir=.git', '--exclude-dir=target',
    '--exclude-dir=dist', '--exclude-dir=build', '--exclude-dir=.next',
  );

  if (!matchCase) args.push('-i');
  if (!useRegex) args.push('-F'); // fixed string (literal match)

  args.push('--', query, workspaceRoot);

  const cmd = Command.create('grep', args);
  
  return new Promise<FileResult[]>((resolve, reject) => {
    let stdout = '';
    
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    signal.addEventListener('abort', () => {
      child?.kill();
      reject(new DOMException('Aborted', 'AbortError'));
    });

    let child: Awaited<ReturnType<typeof cmd.spawn>> | null = null;

    cmd.on('close', () => {
      resolve(parseGrepOutput(stdout, workspaceRoot));
    });

    cmd.on('error', () => {
      // grep returns exit 1 when no matches — that's fine
      resolve(parseGrepOutput(stdout, workspaceRoot));
    });

    cmd.stdout.on('data', (line) => {
      stdout += line + '\n';
    });

    cmd.spawn().then(c => { child = c; }).catch(() => {
      resolve([]);
    });
  });
}

// ─── Result Item Component ──────────────────────────────────

function SearchResultFile({ result, onMatchClick }: { result: FileResult; onMatchClick: (path: string, line: number) => void }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-1.5 px-3 py-1.5 text-left hover:bg-white/5 text-sm group"
      >
        <span className="text-slate-500 w-4 flex-shrink-0">
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <FileText size={13} className="text-slate-400 flex-shrink-0" />
        <span className="text-slate-200 truncate flex-1 font-medium text-xs">{result.fileName}</span>
        <span className="text-slate-500 text-[11px] tabular-nums flex-shrink-0">{result.matches.length}</span>
      </button>

      {isOpen && (
        <div className="flex flex-col">
          {result.matches.map((match, i) => (
            <button
              key={`${match.line}-${i}`}
              onClick={() => onMatchClick(result.filePath, match.line)}
              className="flex items-start gap-2 px-3 pl-10 py-1 text-left hover:bg-emerald-500/10 transition-colors group"
            >
              <span className="text-slate-500 text-[11px] tabular-nums w-8 text-right flex-shrink-0 pt-px">
                {match.line}
              </span>
              <span className="text-slate-300 text-xs font-mono truncate leading-5">
                {match.content}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────

export function GlobalSearch() {
  const { workspaceRoot, openFile } = useEditorStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FileResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [matchCase, setMatchCase] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [matchWord, setMatchWord] = useState(false);
  const [searchTime, setSearchTime] = useState<number | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const executeSearch = useCallback(async (searchQuery: string) => {
    // Cancel previous search
    abortRef.current?.abort();

    if (!searchQuery.trim() || !workspaceRoot) {
      setResults([]);
      setHasSearched(false);
      setSearchTime(null);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setIsSearching(true);
    setHasSearched(true);
    const startTime = performance.now();

    try {
      let finalQuery = searchQuery;
      if (matchWord && !useRegex) {
        finalQuery = `\\b${searchQuery}\\b`;
      }

      let searchResults: FileResult[];
      if (isTauri()) {
        searchResults = await tauriSearch(finalQuery, workspaceRoot, matchCase, useRegex || matchWord, controller.signal);
      } else {
        searchResults = await browserSearch(finalQuery, matchCase);
      }

      if (!controller.signal.aborted) {
        setResults(searchResults);
        setSearchTime(Math.round(performance.now() - startTime));
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // Search was cancelled, ignore
      } else {
        console.error('[GlobalSearch] Search error:', err);
        setResults([]);
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsSearching(false);
      }
    }
  }, [workspaceRoot, matchCase, useRegex, matchWord]);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      executeSearch(value);
    }, 300);
  }, [executeSearch]);

  // Re-search when options change (if query exists)
  useEffect(() => {
    if (query.trim()) {
      executeSearch(query);
    }
  }, [matchCase, useRegex, matchWord]);

  const handleMatchClick = useCallback(async (filePath: string, line: number) => {
    await openFile(filePath);
    // Attempt to scroll Monaco to the line — we dispatch a custom event
    // that MonacoEditor can listen for
    window.dispatchEvent(new CustomEvent('autarch:reveal-line', { detail: { line } }));
  }, [openFile]);

  const totalMatches = results.reduce((sum, r) => sum + r.matches.length, 0);

  return (
    <div className="flex flex-col h-full bg-[#0E0E11] border-r border-white/5 overflow-hidden w-full">
      {/* Header */}
      <div className="p-3 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0E0E11] z-10">
        <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Search</h3>
      </div>

      {/* Search Input Area */}
      <div className="px-3 py-2 border-b border-white/5">
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-2.5 text-slate-500 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search in workspace..."
            className="w-full pl-8 pr-2 py-1.5 bg-white/5 border border-white/10 rounded-md text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 font-mono"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (debounceRef.current) clearTimeout(debounceRef.current);
                executeSearch(query);
              }
            }}
          />
          {isSearching && (
            <Loader2 size={14} className="absolute right-2.5 text-emerald-400 animate-spin" />
          )}
        </div>

        {/* Option toggles */}
        <div className="flex items-center gap-1 mt-2">
          <button
            onClick={() => setMatchCase(!matchCase)}
            className={clsx(
              "p-1 rounded text-[11px] font-mono transition-colors",
              matchCase
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent"
            )}
            title="Match Case"
          >
            <CaseSensitive size={16} />
          </button>
          <button
            onClick={() => setMatchWord(!matchWord)}
            className={clsx(
              "p-1 rounded text-[11px] font-mono transition-colors",
              matchWord
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent"
            )}
            title="Match Whole Word"
          >
            <WholeWord size={16} />
          </button>
          <button
            onClick={() => setUseRegex(!useRegex)}
            className={clsx(
              "p-1 rounded text-[11px] font-mono transition-colors",
              useRegex
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent"
            )}
            title="Use Regular Expression"
          >
            <Regex size={16} />
          </button>
        </div>
      </div>

      {/* No workspace CTA */}
      {!workspaceRoot && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <Search size={32} className="mx-auto mb-3 text-slate-600" />
            <p className="text-xs text-slate-500">Open a workspace to search files.</p>
            <button
              onClick={() => useEditorStore.getState().openWorkspace()}
              className="mt-3 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
            >
              Open Folder
            </button>
          </div>
        </div>
      )}

      {/* Results Area */}
      {workspaceRoot && (
        <div className="flex-1 overflow-y-auto">
          {!hasSearched && !query && (
            <div className="flex items-center justify-center h-full">
              <p className="text-xs text-slate-500">Type to search across all workspace files.</p>
            </div>
          )}

          {hasSearched && !isSearching && results.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <Search size={28} className="text-slate-600" />
              <p className="text-xs text-slate-500">No results found for "{query}"</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="py-1">
              {results.map((result) => (
                <SearchResultFile
                  key={result.filePath}
                  result={result}
                  onMatchClick={handleMatchClick}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer Stats */}
      {hasSearched && results.length > 0 && (
        <div className="px-3 py-1.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span>{totalMatches} results in {results.length} files</span>
          {searchTime !== null && <span>{searchTime}ms</span>}
        </div>
      )}
    </div>
  );
}

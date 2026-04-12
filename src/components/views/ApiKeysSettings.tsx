import { useState, useEffect } from 'react';
import { syncToHermes, isHermesConfigAvailable } from '../../services/hermesBridge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key,
  Database,
  AtSign,
  Send,
  Globe,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  Trash2,
  Shield,
  Plus,
  Server,
  FileJson,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

// ─── Storage Helpers ────────────────────────────────────────────

const STORAGE_PREFIX = 'autarch:apikeys:';
const MCP_CONFIG_KEY = 'autarch:mcp-config';

function loadKey(service: string): string {
  try {
    return localStorage.getItem(`${STORAGE_PREFIX}${service}`) ?? '';
  } catch { return ''; }
}

function saveKey(service: string, value: string) {
  if (value) {
    localStorage.setItem(`${STORAGE_PREFIX}${service}`, value);
  } else {
    localStorage.removeItem(`${STORAGE_PREFIX}${service}`);
  }
}

function loadMcpConfig(): string {
  try {
    return localStorage.getItem(MCP_CONFIG_KEY) ?? DEFAULT_MCP_CONFIG;
  } catch { return DEFAULT_MCP_CONFIG; }
}


const DEFAULT_MCP_CONFIG = JSON.stringify({
  mcpServers: {
    supabase: {
      command: "npx",
      args: ["-y", "@supabase/mcp-server"],
      env: { SUPABASE_URL: "", SUPABASE_SERVICE_ROLE_KEY: "" },
    },
    github: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-github"],
      env: { GITHUB_PERSONAL_ACCESS_TOKEN: "" },
    },
  },
}, null, 2);

// ─── API Key Field ──────────────────────────────────────────────

interface ApiKeyService {
  id: string;
  label: string;
  description: string;
  icon: typeof Key;
  iconColor: string;
  placeholder: string;
  fields: { key: string; label: string; placeholder: string; secret?: boolean }[];
}

const API_SERVICES: ApiKeyService[] = [
  {
    id: 'supabase',
    label: 'Supabase',
    description: 'Backend-as-a-Service — Database, Auth, Edge Functions',
    icon: Database,
    iconColor: '#3ECF8E',
    placeholder: 'project-url',
    fields: [
      { key: 'url', label: 'Project URL', placeholder: 'https://xxxx.supabase.co' },
      { key: 'anon_key', label: 'Anon Key', placeholder: 'eyJhbGciOi...', secret: true },
      { key: 'service_role', label: 'Service Role Key', placeholder: 'eyJhbGciOi...', secret: true },
    ],
  },
  {
    id: 'operator_secret',
    label: 'Operator Secret',
    description: 'Edge Function auth — x-operator-secret header for CMS pipeline',
    icon: Shield,
    iconColor: 'var(--color-accent)',
    placeholder: 'secret',
    fields: [
      { key: 'secret', label: 'Operator Secret', placeholder: 'your-operator-secret...', secret: true },
    ],
  },
  {
    id: 'x_twitter',
    label: 'X / Twitter',
    description: 'Posting API — OAuth2 bearer token for automated thread publishing',
    icon: AtSign,
    iconColor: '#1DA1F2',
    placeholder: 'bearer-token',
    fields: [
      { key: 'bearer_token', label: 'Bearer Token', placeholder: 'AAAA...', secret: true },
      { key: 'api_key', label: 'API Key', placeholder: 'consumer key', secret: true },
      { key: 'api_secret', label: 'API Secret', placeholder: 'consumer secret', secret: true },
    ],
  },
  {
    id: 'reddit',
    label: 'Reddit',
    description: 'Posting API — Client credentials for subreddit auto-posting',
    icon: Globe,
    iconColor: '#FF4500',
    placeholder: 'client-id',
    fields: [
      { key: 'client_id', label: 'Client ID', placeholder: 'app client id' },
      { key: 'client_secret', label: 'Client Secret', placeholder: 'app secret', secret: true },
      { key: 'username', label: 'Username', placeholder: 'u/your-bot-account' },
      { key: 'password', label: 'Password', placeholder: '••••••••', secret: true },
    ],
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    description: 'Posting API — OAuth2 access token for professional content publishing',
    icon: Send,
    iconColor: '#0A66C2',
    placeholder: 'access-token',
    fields: [
      { key: 'access_token', label: 'Access Token', placeholder: 'AQV...', secret: true },
      { key: 'org_id', label: 'Organization ID', placeholder: 'urn:li:organization:xxxx' },
    ],
  },
];

// ─── Single Service Card ────────────────────────────────────────

function ServiceKeyCard({ service }: { service: ApiKeyService }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(true);
  const [justSaved, setJustSaved] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const loaded: Record<string, string> = {};
    service.fields.forEach((f) => {
      loaded[f.key] = loadKey(`${service.id}:${f.key}`);
    });
    setValues(loaded);
  }, [service]);

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    Object.entries(values).forEach(([key, val]) => {
      saveKey(`${service.id}:${key}`, val);
    });
    setSaved(true);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const handleClear = () => {
    const cleared: Record<string, string> = {};
    service.fields.forEach((f) => {
      cleared[f.key] = '';
      saveKey(`${service.id}:${f.key}`, '');
    });
    setValues(cleared);
    setSaved(true);
  };

  const hasAnyValue = Object.values(values).some((v) => v.length > 0);

  return (
    <motion.div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'var(--color-surface-section)',
        border: '1px solid var(--color-border-ghost)',
      }}
      whileHover={{ borderColor: 'rgba(255,255,255,0.06)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--color-border-ghost)' }}>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${service.iconColor}12`, border: `1px solid ${service.iconColor}20` }}
        >
          <service.icon className="w-4 h-4" style={{ color: service.iconColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
              {service.label}
            </h3>
            {hasAnyValue && (
              <span
                className="text-[9px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider"
                style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}
              >
                configured
              </span>
            )}
          </div>
          <p className="text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>{service.description}</p>
        </div>
      </div>

      {/* Fields */}
      <div className="px-5 py-4 space-y-3">
        {service.fields.map((field) => (
          <div key={field.key}>
            <label className="flex items-center gap-1.5 mb-1">
              <Key className="w-3 h-3" style={{ color: 'var(--color-text-tertiary)' }} />
              <span
                className="text-[10px] uppercase tracking-wider font-medium"
                style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}
              >
                {field.label}
              </span>
            </label>
            <div className="relative">
              <input
                type={field.secret && !visibility[field.key] ? 'password' : 'text'}
                value={values[field.key] ?? ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 pr-8 rounded-md text-xs outline-none"
                style={{
                  background: 'var(--color-surface-component)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-ghost)',
                  fontFamily: 'var(--font-mono)',
                }}
              />
              {field.secret && (
                <button
                  onClick={() => setVisibility((prev) => ({ ...prev, [field.key]: !prev[field.key] }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  {visibility[field.key] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-5 py-3" style={{ borderTop: '1px solid var(--color-border-ghost)' }}>
        <motion.button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium"
          style={!saved ? {
            background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dim))',
            color: '#000',
          } : {
            background: justSaved ? 'rgba(16,185,129,0.1)' : 'var(--color-surface-component)',
            color: justSaved ? 'var(--color-success)' : 'var(--color-text-tertiary)',
            border: `1px solid ${justSaved ? 'rgba(16,185,129,0.2)' : 'var(--color-border-ghost)'}`,
          }}
          whileHover={!saved ? { scale: 1.02, boxShadow: '0 0 16px var(--color-accent-glow)' } : undefined}
          whileTap={{ scale: 0.97 }}
        >
          {justSaved ? <CheckCircle2 className="w-3 h-3" /> : <Save className="w-3 h-3" />}
          {justSaved ? 'Saved!' : saved ? 'Saved' : 'Save'}
        </motion.button>
        {hasAnyValue && (
          <motion.button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium"
            style={{
              background: 'var(--color-surface-component)',
              color: 'var(--color-text-tertiary)',
              border: '1px solid var(--color-border-ghost)',
            }}
            whileHover={{ borderColor: 'rgba(239,68,68,0.3)', color: 'var(--color-error)' }}
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ─── MCP Types ──────────────────────────────────────────────────

interface McpServerEntry {
  command: string;
  args: string[];
  env: Record<string, string>;
}

interface McpConfig {
  mcpServers: Record<string, McpServerEntry>;
}

// ─── Known MCP Server Registry (icon + description hints) ───────

const MCP_SERVER_HINTS: Record<string, { label: string; color: string; description: string }> = {
  supabase:  { label: 'Supabase',    color: '#3ECF8E', description: 'Database, Auth, Edge Functions, Realtime' },
  github:    { label: 'GitHub',      color: '#f0f6fc', description: 'Repository management, PRs, Issues' },
  gitnexus:  { label: 'GitNexus',    color: '#a78bfa', description: 'Code Intelligence Graph' },
  cloudrun:  { label: 'Cloud Run',   color: '#4285F4', description: 'Google Cloud Run deployments' },
  stitch:    { label: 'Stitch',      color: '#f472b6', description: 'UI Design System generation' },
  puppeteer: { label: 'Puppeteer',   color: '#00D8A2', description: 'Browser automation & testing' },
  honcho:    { label: 'Honcho',      color: '#fbbf24', description: 'Memory & peer context management' },
  apify:     { label: 'Apify',       color: '#00C7B7', description: 'Web scraping & data extraction' },
  gateway:   { label: 'Gateway',     color: 'var(--color-accent)', description: 'Antigravity MCP Gateway' },
};

function getServerHint(name: string) {
  const lower = name.toLowerCase();
  for (const [key, hint] of Object.entries(MCP_SERVER_HINTS)) {
    if (lower.includes(key)) return hint;
  }
  return { label: name, color: 'var(--color-info)', description: 'Custom MCP server' };
}

// Detect if an env var is likely a secret
function isLikelySecret(key: string): boolean {
  const lower = key.toLowerCase();
  return lower.includes('key') || lower.includes('secret') || lower.includes('token') || lower.includes('password');
}

// ─── Single MCP Server Card ─────────────────────────────────────

function McpServerCard({
  name,
  server,
  onUpdate,
  onDelete,
  onRename,
}: {
  name: string;
  server: McpServerEntry;
  onUpdate: (server: McpServerEntry) => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
}) {
  const hint = getServerHint(name);
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [editing, setEditing] = useState(false);
  const [serverName, setServerName] = useState(name);
  const [newEnvKey, setNewEnvKey] = useState('');
  const [showAddEnv, setShowAddEnv] = useState(false);

  const envEntries = Object.entries(server.env || {});
  const hasValues = envEntries.some(([, v]) => v.length > 0);

  const updateEnv = (key: string, value: string) => {
    onUpdate({ ...server, env: { ...server.env, [key]: value } });
  };

  const removeEnv = (key: string) => {
    const { [key]: _, ...rest } = server.env;
    onUpdate({ ...server, env: rest });
  };

  const addEnvVar = () => {
    if (!newEnvKey.trim()) return;
    onUpdate({ ...server, env: { ...server.env, [newEnvKey.trim().toUpperCase()]: '' } });
    setNewEnvKey('');
    setShowAddEnv(false);
  };

  return (
    <motion.div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'var(--color-surface-section)',
        border: '1px solid var(--color-border-ghost)',
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12, height: 0 }}
      whileHover={{ borderColor: 'rgba(255,255,255,0.06)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--color-border-ghost)' }}>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${hint.color}14`, border: `1px solid ${hint.color}25` }}
        >
          <Server className="w-4 h-4" style={{ color: hint.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {editing ? (
              <input
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                onBlur={() => { onRename(serverName); setEditing(false); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { onRename(serverName); setEditing(false); } }}
                autoFocus
                className="text-sm font-semibold bg-transparent outline-none border-b"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', borderColor: 'var(--color-accent)' }}
              />
            ) : (
              <h3
                className="text-sm font-semibold cursor-pointer"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
                onClick={() => setEditing(true)}
                title="Click to rename"
              >
                {hint.label !== name ? hint.label : name}
              </h3>
            )}
            {hasValues && (
              <span
                className="text-[9px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider"
                style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}
              >
                configured
              </span>
            )}
            <span
              className="text-[9px] px-1.5 py-0.5 rounded font-medium"
              style={{ background: 'var(--color-surface-component)', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}
            >
              {name}
            </span>
          </div>
          <p className="text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>{hint.description}</p>
        </div>
        <motion.button
          onClick={onDelete}
          className="p-1.5 rounded-md"
          style={{ color: 'var(--color-text-tertiary)' }}
          whileHover={{ color: 'var(--color-error)', backgroundColor: 'rgba(239,68,68,0.08)' }}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      {/* Command + Args */}
      <div className="px-5 py-3 space-y-2" style={{ borderBottom: '1px solid var(--color-border-ghost)' }}>
        <div className="flex items-center gap-3">
          <label
            className="text-[10px] uppercase tracking-wider font-medium w-16 flex-shrink-0"
            style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}
          >
            command
          </label>
          <input
            value={server.command}
            onChange={(e) => onUpdate({ ...server, command: e.target.value })}
            className="flex-1 px-2.5 py-1.5 rounded-md text-xs outline-none"
            style={{ background: 'var(--color-surface-component)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-ghost)', fontFamily: 'var(--font-mono)' }}
          />
        </div>
        <div className="flex items-center gap-3">
          <label
            className="text-[10px] uppercase tracking-wider font-medium w-16 flex-shrink-0"
            style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}
          >
            args
          </label>
          <input
            value={server.args.join(' ')}
            onChange={(e) => onUpdate({ ...server, args: e.target.value.split(' ').filter(Boolean) })}
            className="flex-1 px-2.5 py-1.5 rounded-md text-xs outline-none"
            style={{ background: 'var(--color-surface-component)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-ghost)', fontFamily: 'var(--font-mono)' }}
            placeholder="-y @package/name"
          />
        </div>
      </div>

      {/* Environment Variables */}
      <div className="px-5 py-3 space-y-2">
        <div className="flex items-center justify-between mb-1">
          <span
            className="text-[10px] uppercase tracking-wider font-medium"
            style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}
          >
            environment variables ({envEntries.length})
          </span>
          <motion.button
            onClick={() => setShowAddEnv(!showAddEnv)}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium"
            style={{ color: 'var(--color-info)', fontFamily: 'var(--font-mono)' }}
            whileHover={{ backgroundColor: 'rgba(99,102,241,0.08)' }}
          >
            <Plus className="w-3 h-3" />
            Add Var
          </motion.button>
        </div>

        {/* Add Env Input */}
        <AnimatePresence>
          {showAddEnv && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2"
            >
              <input
                value={newEnvKey}
                onChange={(e) => setNewEnvKey(e.target.value.toUpperCase())}
                onKeyDown={(e) => { if (e.key === 'Enter') addEnvVar(); }}
                placeholder="NEW_ENV_VARIABLE"
                autoFocus
                className="flex-1 px-2.5 py-1.5 rounded-md text-xs outline-none"
                style={{ background: 'var(--color-surface-void)', color: 'var(--color-text-primary)', border: '1px solid rgba(99,102,241,0.3)', fontFamily: 'var(--font-mono)' }}
              />
              <motion.button
                onClick={addEnvVar}
                className="px-2.5 py-1.5 rounded-md text-[10px] font-medium"
                style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--color-info)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                Add
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Env Fields */}
        {envEntries.map(([envKey, envVal]) => {
          const secret = isLikelySecret(envKey);
          return (
            <div key={envKey} className="flex items-center gap-2">
              <span
                className="text-[10px] font-medium w-48 flex-shrink-0 truncate"
                style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}
                title={envKey}
              >
                {envKey}
              </span>
              <div className="relative flex-1">
                <input
                  type={secret && !visibility[envKey] ? 'password' : 'text'}
                  value={envVal}
                  onChange={(e) => updateEnv(envKey, e.target.value)}
                  placeholder={secret ? '••••••••' : 'value'}
                  className="w-full px-2.5 py-1.5 pr-14 rounded-md text-xs outline-none"
                  style={{ background: 'var(--color-surface-component)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-ghost)', fontFamily: 'var(--font-mono)' }}
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                  {secret && (
                    <button
                      onClick={() => setVisibility(prev => ({ ...prev, [envKey]: !prev[envKey] }))}
                      className="p-1 rounded"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      {visibility[envKey] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  )}
                  <button
                    onClick={() => removeEnv(envKey)}
                    className="p-1 rounded"
                    style={{ color: 'var(--color-text-tertiary)' }}
                    title="Remove variable"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {envEntries.length === 0 && !showAddEnv && (
          <p className="text-[10px] italic" style={{ color: 'var(--color-text-tertiary)' }}>
            No environment variables configured
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── MCP Config Editor (Visual + Raw JSON) ──────────────────────

function McpConfigEditor() {
  const [config, setConfig] = useState('');
  const [showRawJson, setShowRawJson] = useState(false);
  const [saved, setSaved] = useState(true);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hermesSynced, setHermesSynced] = useState<string | null>(null);
  const [hermesAvailable, setHermesAvailable] = useState(false);

  useEffect(() => {
    setConfig(loadMcpConfig());
    isHermesConfigAvailable().then(setHermesAvailable);
  }, []);

  // Parse config to structured data
  const parsed: McpConfig | null = (() => {
    try {
      const p = JSON.parse(config);
      if (p && typeof p === 'object' && p.mcpServers) return p as McpConfig;
      return null;
    } catch { return null; }
  })();

  const servers = parsed ? Object.entries(parsed.mcpServers) : [];

  // Sync structured changes back to JSON string
  const updateConfig = (newParsed: McpConfig) => {
    const formatted = JSON.stringify(newParsed, null, 2);
    setConfig(formatted);
    setSaved(false);
    setJsonError(null);
  };

  const handleServerUpdate = (name: string, server: McpServerEntry) => {
    if (!parsed) return;
    updateConfig({ ...parsed, mcpServers: { ...parsed.mcpServers, [name]: server } });
  };

  const handleServerDelete = (name: string) => {
    if (!parsed) return;
    const { [name]: _, ...rest } = parsed.mcpServers;
    updateConfig({ ...parsed, mcpServers: rest });
  };

  const handleServerRename = (oldName: string, newName: string) => {
    if (!parsed || oldName === newName || !newName.trim()) return;
    const entries = Object.entries(parsed.mcpServers);
    const newServers: Record<string, McpServerEntry> = {};
    for (const [k, v] of entries) {
      newServers[k === oldName ? newName.trim() : k] = v;
    }
    updateConfig({ ...parsed, mcpServers: newServers });
  };

  const addServer = () => {
    const base = parsed ?? { mcpServers: {} };
    const name = `server-${Object.keys(base.mcpServers).length + 1}`;
    updateConfig({
      ...base,
      mcpServers: {
        ...base.mcpServers,
        [name]: { command: 'npx', args: ['-y', 'your-mcp-server-package'], env: {} },
      },
    });
  };

  const handleRawJsonChange = (text: string) => {
    setConfig(text);
    setSaved(false);
    try {
      JSON.parse(text);
      setJsonError(null);
    } catch (e) {
      setJsonError((e as Error).message);
    }
  };

  const handleSave = async () => {
    let configToSave = config;
    try {
      const formatted = JSON.stringify(JSON.parse(config), null, 2);
      setConfig(formatted);
      configToSave = formatted;
    } catch {
      if (jsonError) return;
    }

    // Save to localStorage
    localStorage.setItem(MCP_CONFIG_KEY, configToSave);

    // Sync to Hermes config.yaml
    const result = await syncToHermes(configToSave);
    if (result.success) {
      setHermesSynced(`${result.serversWritten} servers → Hermes`);
      setTimeout(() => setHermesSynced(null), 3000);
    }

    setSaved(true);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(config);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setConfig(DEFAULT_MCP_CONFIG);
    setSaved(false);
    setJsonError(null);
  };

  return (
    <div className="space-y-3">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] px-2 py-0.5 rounded font-medium uppercase tracking-wider"
            style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--color-info)', fontFamily: 'var(--font-mono)' }}
          >
            {servers.length} server{servers.length !== 1 ? 's' : ''}
          </span>
          {!saved && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[10px] px-2 py-0.5 rounded font-medium"
              style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}
            >
              unsaved changes
            </motion.span>
          )}
          {hermesSynced && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-[10px] px-2 py-0.5 rounded font-medium"
              style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}
            >
              ✓ {hermesSynced}
            </motion.span>
          )}
          {hermesAvailable && !hermesSynced && saved && (
            <span
              className="text-[10px] px-2 py-0.5 rounded font-medium"
              style={{ background: 'rgba(34,197,94,0.06)', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}
            >
              hermes linked
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {/* Raw JSON Toggle */}
          <motion.button
            onClick={() => setShowRawJson(!showRawJson)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-medium"
            style={{
              background: showRawJson ? 'rgba(99,102,241,0.12)' : 'var(--color-surface-component)',
              color: showRawJson ? 'var(--color-info)' : 'var(--color-text-tertiary)',
              border: `1px solid ${showRawJson ? 'rgba(99,102,241,0.25)' : 'var(--color-border-ghost)'}`,
              fontFamily: 'var(--font-mono)',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <FileJson className="w-3 h-3" />
            {showRawJson ? 'Visual Mode' : 'Raw JSON'}
          </motion.button>
          {/* Add Server */}
          <motion.button
            onClick={addServer}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-medium"
            style={{
              background: 'var(--color-surface-interactive)',
              color: 'var(--color-info)',
              border: '1px solid rgba(99,102,241,0.2)',
              fontFamily: 'var(--font-mono)',
            }}
            whileHover={{ borderColor: 'rgba(99,102,241,0.4)', scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus className="w-3 h-3" />
            Add Server
          </motion.button>
        </div>
      </div>

      {/* Visual Mode: Server Cards */}
      {!showRawJson && parsed && (
        <AnimatePresence mode="popLayout">
          {servers.map(([name, server]) => (
            <McpServerCard
              key={name}
              name={name}
              server={server}
              onUpdate={(s) => handleServerUpdate(name, s)}
              onDelete={() => handleServerDelete(name)}
              onRename={(newName) => handleServerRename(name, newName)}
            />
          ))}
        </AnimatePresence>
      )}

      {/* Empty State */}
      {!showRawJson && servers.length === 0 && (
        <motion.div
          className="rounded-xl py-12 flex flex-col items-center gap-3"
          style={{ background: 'var(--color-surface-section)', border: '1px dashed var(--color-border-ghost)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Server className="w-8 h-8" style={{ color: 'var(--color-text-tertiary)', opacity: 0.4 }} />
          <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>No MCP servers configured</p>
          <motion.button
            onClick={addServer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dim))',
              color: '#000',
            }}
            whileHover={{ scale: 1.02, boxShadow: '0 0 16px var(--color-accent-glow)' }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus className="w-3 h-3" />
            Add Your First Server
          </motion.button>
        </motion.div>
      )}

      {/* Raw JSON Mode (fallback) */}
      {showRawJson && (
        <motion.div
          className="rounded-xl overflow-hidden"
          style={{ background: 'var(--color-surface-section)', border: '1px solid var(--color-border-ghost)' }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative">
            <textarea
              value={config}
              onChange={(e) => handleRawJsonChange(e.target.value)}
              className="w-full px-5 py-4 text-[12px] leading-relaxed outline-none resize-none"
              rows={Math.min(20, Math.max(10, config.split('\n').length + 2))}
              spellCheck={false}
              style={{
                background: 'var(--color-surface-void)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-mono)',
                border: 'none',
                tabSize: 2,
              }}
            />
            <motion.button
              onClick={handleCopy}
              className="absolute top-3 right-3 px-2 py-1 rounded text-[10px] font-medium"
              style={{
                background: 'var(--color-surface-component)',
                color: copied ? 'var(--color-success)' : 'var(--color-text-tertiary)',
                border: '1px solid var(--color-border-ghost)',
                fontFamily: 'var(--font-mono)',
              }}
              whileHover={{ borderColor: 'var(--color-border-active)' }}
              whileTap={{ scale: 0.95 }}
            >
              {copied ? <Check className="w-3 h-3 inline mr-1" /> : <Copy className="w-3 h-3 inline mr-1" />}
              {copied ? 'Copied' : 'Copy'}
            </motion.button>
          </div>
          <AnimatePresence>
            {jsonError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-5 py-2 flex items-center gap-2"
                style={{ background: 'rgba(239,68,68,0.06)', borderTop: '1px solid rgba(239,68,68,0.15)' }}
              >
                <AlertCircle className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--color-error)' }} />
                <span className="text-[10px] truncate" style={{ color: 'var(--color-error)', fontFamily: 'var(--font-mono)' }}>
                  {jsonError}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Action Bar */}
      <div className="flex items-center gap-2">
        <motion.button
          onClick={handleSave}
          disabled={!!jsonError}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium"
          style={!saved && !jsonError ? {
            background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dim))',
            color: '#000',
          } : {
            background: justSaved ? 'rgba(16,185,129,0.1)' : 'var(--color-surface-component)',
            color: justSaved ? 'var(--color-success)' : 'var(--color-text-tertiary)',
            border: `1px solid ${justSaved ? 'rgba(16,185,129,0.2)' : 'var(--color-border-ghost)'}`,
            opacity: jsonError ? 0.4 : 1,
          }}
          whileHover={!saved && !jsonError ? { scale: 1.02, boxShadow: '0 0 16px var(--color-accent-glow)' } : undefined}
          whileTap={{ scale: 0.97 }}
        >
          {justSaved ? <CheckCircle2 className="w-3 h-3" /> : <Save className="w-3 h-3" />}
          {justSaved ? 'Saved!' : 'Save Config'}
        </motion.button>
        <motion.button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium"
          style={{
            background: 'var(--color-surface-component)',
            color: 'var(--color-text-tertiary)',
            border: '1px solid var(--color-border-ghost)',
          }}
          whileHover={{ borderColor: 'rgba(239,68,68,0.3)', color: 'var(--color-error)' }}
        >
          <FileJson className="w-3 h-3" />
          Reset to Default
        </motion.button>
      </div>
    </div>
  );
}

// ─── Combined Settings View ─────────────────────────────────────

export function ApiKeysSettings() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto py-10 px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
          >
            API Keys & Integrations
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-tertiary)', lineHeight: 1.6 }}>
            Configure BYOK credentials for backend services and publishing APIs. All keys are stored in <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', fontSize: '12px' }}>localStorage</code> — never transmitted to any third party.
          </p>
        </div>

        {/* Section: Platform APIs */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <h2
              className="text-xs font-semibold tracking-wider uppercase"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-secondary)' }}
            >
              Service Credentials
            </h2>
          </div>
          <div className="space-y-3">
            {API_SERVICES.map((s) => (
              <ServiceKeyCard key={s.id} service={s} />
            ))}
          </div>
        </section>

        {/* Section: MCP Config */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 rounded-full" style={{ background: 'var(--color-info)' }} />
            <h2
              className="text-xs font-semibold tracking-wider uppercase"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-secondary)' }}
            >
              MCP Server Configuration
            </h2>
          </div>
          <McpConfigEditor />
        </section>
      </div>
    </div>
  );
}


import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Code2, 
  Database, 
  GitBranch, 
  Globe, 
  Shield,
  CheckCircle2,
  XCircle, 
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Download,
  Loader2,
} from 'lucide-react';
import { useHermesStore } from '../../stores/hermesStore';
import { useModuleStore } from '../../stores/moduleStore';
import { useEffect, useState, useCallback } from 'react';
import type { ModuleId, InstallStatus } from '../../services/moduleInstaller';

// ─── Module Card ────────────────────────────────────────────────

interface ModuleCardProps {
  name: string;
  description: string;
  icon: typeof Zap;
  status: InstallStatus;
  version?: string;
  detail?: string;
  installable?: boolean;
  moduleId?: ModuleId;
  onAction?: () => void;
  actionLabel?: string;
}

function ModuleCard({ 
  name, description, icon: Icon, status, version, detail, 
  installable, moduleId, onAction, actionLabel,
}: ModuleCardProps) {
  const { installModule, installing, progress } = useModuleStore();
  const isInstalling = installing === moduleId;

  const statusConfig: Record<InstallStatus, { bg: string; border: string; text: string; label: string }> = {
    connected: { bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.15)', text: 'var(--color-success)', label: 'Connected' },
    installed: { bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.15)', text: 'var(--color-success)', label: 'Installed' },
    offline: { bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.15)', text: 'var(--color-error)', label: 'Offline' },
    'not-installed': { bg: 'rgba(113,113,122,0.06)', border: 'rgba(113,113,122,0.15)', text: 'var(--color-text-tertiary)', label: 'Not Installed' },
    checking: { bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.15)', text: 'var(--color-accent)', label: 'Checking...' },
    installing: { bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.15)', text: 'var(--color-accent)', label: 'Installing...' },
    error: { bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.15)', text: 'var(--color-error)', label: 'Error' },
  };

  const displayStatus = isInstalling ? 'installing' : status;
  const s = statusConfig[displayStatus] ?? statusConfig['not-installed'];

  return (
    <motion.div
      className="rounded-xl p-5 flex flex-col gap-3"
      style={{
        background: 'var(--color-surface-section)',
        border: `1px solid var(--color-border-ghost)`,
      }}
      whileHover={{
        borderColor: s.border,
        boxShadow: `0 0 20px ${s.bg}`,
        y: -2,
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: s.bg,
            border: `1px solid ${s.border}`,
          }}
        >
          {isInstalling ? (
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: s.text }} />
          ) : (
            <Icon className="w-5 h-5" style={{ color: s.text }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className="text-sm font-semibold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
            >
              {name}
            </h3>
            {version && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded"
                style={{
                  fontFamily: 'var(--font-mono)',
                  background: 'var(--color-surface-component)',
                  color: 'var(--color-text-tertiary)',
                  border: '1px solid var(--color-border-ghost)',
                }}
              >
                {version}
              </span>
            )}
          </div>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-tertiary)', lineHeight: 1.4 }}>
            {description}
          </p>
        </div>
      </div>

      {/* Status + Detail */}
      <div className="flex items-center gap-2 mt-1">
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-md"
          style={{ background: s.bg, border: `1px solid ${s.border}` }}
        >
          {displayStatus === 'installed' || displayStatus === 'connected' ? (
            <CheckCircle2 className="w-3 h-3" style={{ color: s.text }} />
          ) : displayStatus === 'installing' || displayStatus === 'checking' ? (
            <Loader2 className="w-3 h-3 animate-spin" style={{ color: s.text }} />
          ) : displayStatus === 'error' ? (
            <AlertCircle className="w-3 h-3" style={{ color: s.text }} />
          ) : (
            <XCircle className="w-3 h-3" style={{ color: s.text }} />
          )}
          <span className="text-[10px] font-medium" style={{ fontFamily: 'var(--font-mono)', color: s.text }}>
            {s.label}
          </span>
        </div>
        {detail && (
          <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            {detail}
          </span>
        )}
      </div>

      {/* Install Progress */}
      <AnimatePresence>
        {isInstalling && progress && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg overflow-hidden"
            style={{
              background: 'var(--color-surface-void)',
              border: '1px solid var(--color-border-ghost)',
            }}
          >
            <div className="px-3 py-2">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="w-3 h-3 animate-spin" style={{ color: 'var(--color-accent)' }} />
                <span className="text-[11px] font-medium" style={{ color: 'var(--color-accent)' }}>
                  {progress.step}
                </span>
              </div>
              {/* Progress bar */}
              <div 
                className="h-1 rounded-full overflow-hidden"
                style={{ background: 'var(--color-surface-component)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'var(--color-accent)' }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress.percent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              {/* Terminal output */}
              {progress.output.length > 0 && (
                <div 
                  className="mt-2 max-h-20 overflow-y-auto"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-tertiary)' }}
                >
                  {progress.output.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-1">
        {/* Install button — only show if not installed and installable */}
        {installable && moduleId && status === 'not-installed' && !isInstalling && (
          <motion.button
            onClick={() => installModule(moduleId)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dim))',
              color: '#000',
              border: 'none',
            }}
            whileHover={{ scale: 1.02, boxShadow: '0 0 16px var(--color-accent-glow)' }}
            whileTap={{ scale: 0.97 }}
          >
            <Download className="w-3 h-3" />
            Install {name}
          </motion.button>
        )}

        {/* Custom action */}
        {onAction && (
          <motion.button
            onClick={onAction}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium"
            style={{
              background: 'var(--color-surface-interactive)',
              color: 'var(--color-accent)',
              border: '1px solid var(--color-border-active)',
            }}
            whileHover={{ scale: 1.02, boxShadow: '0 0 12px var(--color-accent-glow)' }}
            whileTap={{ scale: 0.98 }}
          >
            <ExternalLink className="w-3 h-3" />
            {actionLabel ?? 'Configure'}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Settings Modules View ──────────────────────────────────────

export function SettingsModules() {
  const { status, checkConnection } = useHermesStore();
  const { modules, detectAll } = useModuleStore();

  // ── Kit Status ──
  const [kitStatus, setKitStatus] = useState<
    'unknown' | 'applied' | 'available' | 'applying' | 'error' | 'ota-available' | 'ota-downloading'
  >('unknown');
  const [kitVersion, setKitVersion] = useState<string | null>(null);
  const [otaVersion, setOtaVersion] = useState<string | null>(null);
  const [otaProgress, setOtaProgress] = useState<{ percent: number; step: string } | null>(null);

  useEffect(() => {
    checkConnection();
    detectAll();

    // Check kit status on mount (bundled + remote)
    import('../../services/hermesProvisioner').then(async ({ getAppliedKitVersion, isKitUpdateAvailable, checkRemoteKitUpdate }) => {
      const manifest = await getAppliedKitVersion();
      if (manifest) {
        setKitVersion(manifest.version);
      }

      // First check bundled update
      const bundledAvailable = await isKitUpdateAvailable();
      if (bundledAvailable) {
        setKitStatus('available');
        return;
      }

      // Then check remote OTA update (non-blocking)
      if (manifest) {
        setKitStatus('applied');
      }
      try {
        const otaInfo = await checkRemoteKitUpdate();
        if (otaInfo.available) {
          setKitStatus('ota-available');
          setOtaVersion(otaInfo.remoteVersion);
        }
      } catch {
        // Remote check failure is non-fatal
      }
    }).catch(() => {});
  }, [checkConnection, detectAll]);

  const handleReapplyKit = useCallback(async () => {
    setKitStatus('applying');
    try {
      const { forceReapplyKit } = await import('../../services/hermesProvisioner');
      const result = await forceReapplyKit();
      if (result.success) {
        setKitStatus('applied');
        setKitVersion(result.kitVersion);
      } else {
        setKitStatus('error');
        setTimeout(() => setKitStatus('applied'), 3000);
      }
    } catch {
      setKitStatus('error');
      setTimeout(() => setKitStatus('applied'), 3000);
    }
  }, []);

  const handleOtaUpdate = useCallback(async () => {
    setKitStatus('ota-downloading');
    setOtaProgress({ percent: 0, step: 'Starting OTA update...' });
    try {
      const { downloadAndApplyOtaKit } = await import('../../services/hermesProvisioner');
      const result = await downloadAndApplyOtaKit((percent, step) => {
        setOtaProgress({ percent, step });
      });
      if (result.success) {
        setKitStatus('applied');
        setKitVersion(result.kitVersion);
        setOtaVersion(null);
        setOtaProgress(null);
      } else {
        setKitStatus('error');
        setOtaProgress(null);
        setTimeout(() => setKitStatus('applied'), 3000);
      }
    } catch {
      setKitStatus('error');
      setOtaProgress(null);
      setTimeout(() => setKitStatus('applied'), 3000);
    }
  }, []);

  const handleCheckOta = useCallback(async () => {
    try {
      const { checkRemoteKitUpdate } = await import('../../services/hermesProvisioner');
      const otaInfo = await checkRemoteKitUpdate();
      if (otaInfo.available) {
        setKitStatus('ota-available');
        setOtaVersion(otaInfo.remoteVersion);
      }
    } catch {
      // Silent fail
    }
  }, []);

  // Merge detection status with Hermes live status
  const hermesStatus = status.online ? 'installed' as const : 
    modules.hermes.status === 'installed' ? 'offline' as const : 
    modules.hermes.status;

  const kitDetail = kitVersion ? ` · Kit v${kitVersion}` : '';
  const hermesDetail = status.online 
    ? `${status.model} · localhost:8642${kitDetail}`
    : modules.hermes.status === 'installed' 
      ? `${modules.hermes.path} · Run: hermes gateway${kitDetail}`
      : modules.hermes.error 
        ? modules.hermes.error
        : 'Python/uv · git clone + ./setup-hermes.sh';

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto py-10 px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
          >
            Module Manager
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-tertiary)', lineHeight: 1.6 }}>
            AUTARCH auto-detects installed tools and can install missing ones with a single click using their official installers.
          </p>
        </div>

        {/* Section: Agent Engine */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <h2
              className="text-xs font-semibold tracking-wider uppercase"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-secondary)' }}
            >
              Agent Engine
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <ModuleCard
              name="Hermes"
              description="AI coding agent with MCP server orchestration. Powers the Agent Chat and autonomous workflows."
              icon={Zap}
              status={hermesStatus}
              moduleId="hermes"
              installable={!status.online && modules.hermes.status === 'not-installed'}
              version={modules.hermes.version ?? 'v0.9.2'}
              detail={hermesDetail}
              onAction={checkConnection}
              actionLabel="Refresh Status"
            />

            {/* Autarch OS Kit Status */}
            {(modules.hermes.status === 'installed' || status.online) && (
              <motion.div
                className="rounded-lg overflow-hidden"
                style={{
                  background: 'var(--color-surface-section)',
                  border: '1px solid var(--color-border-ghost)',
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 px-5 py-3">
                  <Shield className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                  <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-display)' }}>
                    Autarch OS Kit
                  </span>
                  {kitStatus === 'applied' && kitVersion && (
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider"
                      style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}
                    >
                      v{kitVersion} applied
                    </span>
                  )}
                  {kitStatus === 'available' && (
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider"
                      style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}
                    >
                      bundled update
                    </span>
                  )}
                  {kitStatus === 'ota-available' && otaVersion && (
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider"
                      style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', fontFamily: 'var(--font-mono)' }}
                    >
                      v{otaVersion} remote
                    </span>
                  )}
                  <div className="flex-1" />
                  <div className="flex items-center gap-2">
                    {/* OTA Check Button (only when up-to-date with bundled) */}
                    {kitStatus === 'applied' && (
                      <motion.button
                        onClick={handleCheckOta}
                        className="flex items-center gap-1 px-2 py-1 rounded text-[10px]"
                        style={{
                          color: 'var(--color-text-quaternary)',
                        }}
                        whileHover={{ scale: 1.05, color: 'var(--color-text-secondary)' }}
                        whileTap={{ scale: 0.95 }}
                        title="Check for remote updates"
                      >
                        <Globe className="w-3 h-3" />
                        Check OTA
                      </motion.button>
                    )}
                    {/* Primary Action Button */}
                    <motion.button
                      onClick={
                        kitStatus === 'ota-available' ? handleOtaUpdate :
                        kitStatus === 'available' ? handleReapplyKit :
                        handleReapplyKit
                      }
                      disabled={kitStatus === 'applying' || kitStatus === 'ota-downloading'}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium"
                      style={
                        kitStatus === 'ota-available' ? {
                          background: 'linear-gradient(135deg, #818cf8, #6366f1)',
                          color: '#fff',
                        } : kitStatus === 'available' ? {
                          background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dim))',
                          color: '#000',
                        } : {
                          background: 'var(--color-surface-component)',
                          color: 'var(--color-text-tertiary)',
                          border: '1px solid var(--color-border-ghost)',
                        }
                      }
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {kitStatus === 'applying' ? (
                        <><Loader2 className="w-3 h-3 animate-spin" /> Applying...</>
                      ) : kitStatus === 'ota-downloading' ? (
                        <><Loader2 className="w-3 h-3 animate-spin" /> Downloading...</>
                      ) : kitStatus === 'ota-available' ? (
                        <><Download className="w-3 h-3" /> Update to v{otaVersion}</>
                      ) : kitStatus === 'available' ? (
                        <><Download className="w-3 h-3" /> Update Kit</>
                      ) : (
                        <><RefreshCw className="w-3 h-3" /> Re-apply Kit</>
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* OTA Download Progress */}
                <AnimatePresence>
                  {kitStatus === 'ota-downloading' && otaProgress && (
                    <motion.div
                      className="px-5 pb-3"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px]" style={{ color: 'var(--color-text-quaternary)', fontFamily: 'var(--font-mono)' }}>
                          {otaProgress.step}
                        </span>
                        <div className="flex-1" />
                        <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                          {otaProgress.percent}%
                        </span>
                      </div>
                      <div
                        className="h-1 rounded-full overflow-hidden"
                        style={{ background: 'var(--color-surface-component)' }}
                      >
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: 'linear-gradient(90deg, #818cf8, #6366f1)' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${otaProgress.percent}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </section>

        {/* Section: IDE */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <h2
              className="text-xs font-semibold tracking-wider uppercase"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-secondary)' }}
            >
              IDE Integration
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ModuleCard
              name="Zed Editor"
              description="GPU-accelerated IDE. AUTARCH launches Zed with workspace presets and synced Hermes context."
              icon={Code2}
              status={modules.zed.status === 'installed' ? 'installed' : 'not-installed'}
              moduleId="zed"
              installable={modules.zed.status === 'not-installed'}
              version={modules.zed.version}
              detail={modules.zed.path ?? (modules.zed.status === 'not-installed' ? 'brew install --cask zed · zed.dev' : undefined)}
            />
            <ModuleCard
              name="Monaco Editor"
              description="Embedded code viewer for quick edits, config files, and agent output inspection."
              icon={Code2}
              status="installed"
              version="built-in"
              detail="Embedded · always available"
            />
          </div>
        </section>

        {/* Section: Infrastructure */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <h2
              className="text-xs font-semibold tracking-wider uppercase"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-secondary)' }}
            >
              Infrastructure
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ModuleCard
              name="Supabase"
              description="Backend-as-a-Service for auth, database, edge functions, and realtime subscriptions."
              icon={Database}
              status="not-installed"
              detail="BYOK · Bring Your Own Key"
              actionLabel="Add API Key"
            />
            <ModuleCard
              name="GitHub"
              description="Version control, CI/CD, and repository management for all managed workspaces."
              icon={GitBranch}
              status="not-installed"
              detail="BYOK · Personal Token"
              actionLabel="Add Token"
            />
            <ModuleCard
              name="Vercel"
              description="Edge deployment platform for frontend previews and production deployments."
              icon={Globe}
              status="not-installed"
              detail="BYOK · API Token"
              actionLabel="Add Token"
            />
            <ModuleCard
              name="MCP Servers"
              description="Model Context Protocol servers managed by Hermes. Auto-detected from hermes config.yaml."
              icon={Shield}
              status={status.online ? 'installed' : 'not-installed'}
              detail={status.online ? 'Auto-detected via Hermes' : 'Requires Hermes'}
            />
          </div>
        </section>

        {/* Refresh All */}
        <div className="flex justify-center pt-4 pb-8">
          <motion.button
            onClick={async () => {
              await detectAll();
              checkConnection();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium"
            style={{
              background: 'var(--color-surface-component)',
              color: 'var(--color-text-tertiary)',
              border: '1px solid var(--color-border-ghost)',
            }}
            whileHover={{
              borderColor: 'var(--color-border-active)',
              color: 'var(--color-accent)',
            }}
            whileTap={{ scale: 0.97 }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Re-Detect All Modules
          </motion.button>
        </div>
      </div>
    </div>
  );
}

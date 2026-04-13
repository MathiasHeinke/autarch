/**
 * Hermes Post-Install Provisioner
 *
 * Applies the Autarch OS configuration kit (personas, SOUL.md, skill library)
 * to a local Hermes Agent installation. Designed for idempotent, non-destructive
 * provisioning with version tracking and automatic upgrade detection.
 *
 * Architecture:
 *   Bundled hermes-kit/ ──► ~/.hermes/config.yaml  (persona config)
 *                        ──► ~/.hermes/SOUL.md      (identity)
 *                        ──► ~/.autarch/skills/     (skill library)
 *                        ──► ~/.autarch/kit.json    (version tracker)
 *
 *   OTA Update Flow:
 *   Remote manifest  ──► version check ──► curl downloads to staging
 *                     ──► verify ──► apply to ~/.hermes + ~/.autarch
 *
 * Entry Points:
 *   - applyHermesKit()            →  Post-install hook (bundled kit)
 *   - forceReapplyKit()           →  Manual "Re-apply Kit" button
 *   - isKitUpdateAvailable()      →  Bundled vs applied version check
 *   - checkRemoteKitUpdate()      →  OTA: remote vs applied version check
 *   - downloadAndApplyOtaKit()    →  OTA: download + apply remote kit
 */

// ─── Types ──────────────────────────────────────────────────────

export interface KitManifest {
  version: string;
  name?: string;
  description?: string;
  appliedAt?: string;
  files: string[];
  /** Base URL for OTA downloads (e.g. GitHub raw content URL) */
  remoteBaseUrl?: string;
  /** SHA-256 of the kit archive for integrity verification (future) */
  sha256?: string;
}

export interface ProvisionResult {
  success: boolean;
  applied: string[];
  errors: string[];
  kitVersion: string;
  wasUpgrade: boolean;
}

export interface OtaUpdateInfo {
  available: boolean;
  currentVersion: string | null;
  remoteVersion: string;
  remoteBaseUrl: string;
}

export interface OtaUpdateResult extends ProvisionResult {
  downloadedFiles: string[];
}

// ─── Shell Helpers (shared pattern from hermesBridge.ts) ────────

async function execShell(
  command: string,
  args: string[]
): Promise<{ code: number; stdout: string; stderr: string }> {
  try {
    const { Command } = await import('@tauri-apps/plugin-shell');
    const cmd = Command.create(command, args);
    const result = await cmd.execute();
    return {
      code: result.code ?? -1,
      stdout: result.stdout,
      stderr: result.stderr,
    };
  } catch {
    console.warn('[HermesProvisioner] Tauri shell not available');
    return { code: 1, stdout: '', stderr: 'Tauri shell not available' };
  }
}

// Module-level cache for home directory (P-01 Carmack Fix: avoid repeated shell calls)
let _homeDirCache: string | null = null;

async function getHomeDir(): Promise<string> {
  if (_homeDirCache) return _homeDirCache;
  const result = await execShell('sh', ['-c', 'echo $HOME']);
  _homeDirCache = result.stdout.trim() || '/tmp';
  return _homeDirCache;
}

// ─── Kit Source Resolution ──────────────────────────────────────

/**
 * Resolve the path to the bundled hermes-kit/ directory.
 *
 * Production (Tauri): resolveResource('hermes-kit')
 * Dev mode: Derive from the Tauri src-tauri/ parent directory
 */
async function getKitSourcePath(presetKitPath?: string): Promise<string> {
  const kitName = presetKitPath || 'hermes-kit';
  try {
    const { resolveResource } = await import('@tauri-apps/api/path');
    return await resolveResource(kitName);
  } catch {
    // S-01 Fix: In Tauri dev mode, CWD is src-tauri/.
    // Navigate to project root by going one level up.
    const result = await execShell('sh', ['-c', 
      `if [ -d "$(pwd)/../${kitName}" ]; then echo "$(pwd)/../${kitName}"; elif [ -d "$(pwd)/${kitName}" ]; then echo "$(pwd)/${kitName}"; else echo ""; fi`
    ]);
    const resolved = result.stdout.trim();
    if (resolved) return resolved;
    
    // Last resort: assume project root is two levels up from src-tauri
    const home = await getHomeDir();
    return `${home}/Developer/autarch/${kitName}`;
  }
}

// ─── Version Management ─────────────────────────────────────────

/**
 * Read the currently applied kit version from ~/.autarch/kit.json.
 * Returns null if no kit has been applied yet.
 */
export async function getAppliedKitVersion(): Promise<KitManifest | null> {
  const home = await getHomeDir();
  const result = await execShell('cat', [`${home}/.autarch/kit.json`]);
  if (result.code !== 0) return null;

  try {
    return JSON.parse(result.stdout) as KitManifest;
  } catch {
    return null;
  }
}

/**
 * Read the bundled kit version from hermes-kit/kit-manifest.json.
 */
async function getBundledKitVersion(): Promise<KitManifest> {
  const kitPath = await getKitSourcePath();
  const result = await execShell('cat', [`${kitPath}/kit-manifest.json`]);

  if (result.code !== 0) {
    return { version: '0.0.0', files: [] };
  }

  try {
    return JSON.parse(result.stdout) as KitManifest;
  } catch {
    return { version: '0.0.0', files: [] };
  }
}

/**
 * Compare two semver strings. Returns true if a > b.
 */
function semverGt(a: string, b: string): boolean {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const va = pa[i] ?? 0;
    const vb = pb[i] ?? 0;
    if (va > vb) return true;
    if (va < vb) return false;
  }
  return false;
}

/**
 * Check if the bundled kit is newer than the applied kit.
 */
export async function isKitUpdateAvailable(): Promise<boolean> {
  const applied = await getAppliedKitVersion();
  if (!applied) return true; // Never applied → update available

  const bundled = await getBundledKitVersion();
  return semverGt(bundled.version, applied.version);
}

// ─── Core Provisioning ──────────────────────────────────────────

/**
 * Apply the Autarch OS Hermes Kit to the local system.
 *
 * Steps:
 * 1. Ensure target directories exist (~/.hermes, ~/.autarch/skills)
 * 2. Read bundled kit manifest for version info
 * 3. Skip if same version already applied (unless force=true)
 * 4. Backup existing config.yaml if user-modified
 * 5. Copy config.yaml → ~/.hermes/
 * 6. Copy SOUL.md → ~/.hermes/
 * 7. Copy skills/ → ~/.autarch/skills/
 * 8. Write version tracker → ~/.autarch/kit.json
 *
 * @param force - Skip version check, always re-apply
 */
async function provisionKit(force: boolean): Promise<ProvisionResult> {
  const result: ProvisionResult = {
    success: false,
    applied: [],
    errors: [],
    kitVersion: '0.0.0',
    wasUpgrade: false,
  };

  try {
    const home = await getHomeDir();
    const hermesHome = `${home}/.hermes`;
    const autarchHome = `${home}/.autarch`;
    const kitSource = await getKitSourcePath();

    // Verify kit source exists
    const kitCheck = await execShell('test', ['-d', kitSource]);
    if (kitCheck.code !== 0) {
      result.errors.push(`Kit source not found: ${kitSource}`);
      return result;
    }

    // 1. Ensure target directories exist
    await execShell('mkdir', ['-p', hermesHome]);
    await execShell('mkdir', ['-p', `${autarchHome}/skills`]);

    // 2. Read bundled kit manifest
    const manifest = await getBundledKitVersion();
    result.kitVersion = manifest.version;

    // 3. Check if this is an upgrade or first-time
    const existing = await getAppliedKitVersion();
    result.wasUpgrade = existing !== null;

    // Version gate (skip if same version, unless forced)
    if (!force && existing && existing.version === manifest.version) {
      result.success = true;
      result.applied = ['(already up-to-date)'];
      return result;
    }

    // 4. Backup existing config.yaml if present and user-modified
    const existingConfig = await execShell('cat', [`${hermesHome}/config.yaml`]);
    if (existingConfig.code === 0 && existingConfig.stdout.trim()) {
      const isAutarchKit = existingConfig.stdout.includes('# Autarch OS Kit');
      if (!isAutarchKit) {
        const backupResult = await execShell('cp', [
          `${hermesHome}/config.yaml`,
          `${hermesHome}/config.yaml.bak`,
        ]);
        if (backupResult.code === 0) {
          result.applied.push('config.yaml.bak (backup)');
        }
      }
    }

    // 5. Copy config.yaml
    const configSrc = `${kitSource}/config.yaml`;
    const configCheck = await execShell('test', ['-f', configSrc]);
    if (configCheck.code === 0) {
      const configCopy = await execShell('cp', [configSrc, `${hermesHome}/config.yaml`]);
      if (configCopy.code === 0) {
        result.applied.push('config.yaml');
      } else {
        result.errors.push(`config.yaml: ${configCopy.stderr}`);
      }
    } else {
      result.errors.push('config.yaml: not found in kit');
    }

    // 6. Copy SOUL.md
    const soulSrc = `${kitSource}/SOUL.md`;
    const soulCheck = await execShell('test', ['-f', soulSrc]);
    if (soulCheck.code === 0) {
      const soulCopy = await execShell('cp', [soulSrc, `${hermesHome}/SOUL.md`]);
      if (soulCopy.code === 0) {
        result.applied.push('SOUL.md');
      } else {
        result.errors.push(`SOUL.md: ${soulCopy.stderr}`);
      }
    } else {
      result.errors.push('SOUL.md: not found in kit');
    }

    // 7. Copy skills (recursive)
    const skillsSrc = `${kitSource}/skills`;
    const skillsCheck = await execShell('test', ['-d', skillsSrc]);
    if (skillsCheck.code === 0) {
      // S-02 Fix: Use separate exit code marker to avoid stdout pollution
      const skillsCopy = await execShell('sh', [
        '-c',
        `cp -R "${skillsSrc}/"* "${autarchHome}/skills/" 2>/dev/null`,
      ]);
      if (skillsCopy.code === 0) {
        const countResult = await execShell('sh', [
          '-c',
          `ls -d "${autarchHome}/skills/"*/ 2>/dev/null | wc -l`,
        ]);
        const skillCount = parseInt(countResult.stdout.trim()) || 0;
        result.applied.push(`skills/ (${skillCount} agents)`);
      } else {
        result.errors.push('skills/: copy failed');
      }
    }

    // 8. Write version tracker → ~/.autarch/kit.json
    const kitJson: KitManifest = {
      version: manifest.version,
      appliedAt: new Date().toISOString(),
      files: result.applied.filter((f) => !f.includes('backup')),
    };
    const kitJsonContent = JSON.stringify(kitJson, null, 2);
    const b64 = btoa(unescape(encodeURIComponent(kitJsonContent)));
    await execShell('sh', [
      '-c',
      `echo '${b64}' | base64 -d > "${autarchHome}/kit.json"`,
    ]);

    result.success = result.errors.length === 0;

    if (result.success) {
      console.warn(
        `[HermesProvisioner] Kit v${manifest.version} applied: ${result.applied.join(', ')}`
      );
    } else {
      console.warn(
        `[HermesProvisioner] Kit v${manifest.version} partially applied. Errors: ${result.errors.join(', ')}`
      );
    }
  } catch (e) {
    result.errors.push(
      `Fatal: ${e instanceof Error ? e.message : 'Unknown error'}`
    );
  }

  return result;
}

// ─── Public API ─────────────────────────────────────────────────

/**
 * Apply Hermes Kit post-install. Skips if same version already applied.
 * Called automatically after Hermes installation completes.
 */
export async function applyHermesKit(): Promise<ProvisionResult> {
  return provisionKit(false);
}

/**
 * Force re-apply kit, ignoring version check.
 * Used by the "Re-apply Kit" button in the UI.
 */
export async function forceReapplyKit(): Promise<ProvisionResult> {
  return provisionKit(true);
}

// ─── OTA Kit Update ────────────────────────────────────────────

/**
 * Default remote manifest URL. Overridden by kit-manifest.json's remoteBaseUrl.
 */
const DEFAULT_REMOTE_BASE_URL = 'https://raw.githubusercontent.com/autarch/autarch/main/hermes-kit';

/**
 * Check if a remote kit update is available (OTA).
 * 
 * Fetches the remote kit-manifest.json and compares its version
 * against the locally applied kit version.
 */
export async function checkRemoteKitUpdate(): Promise<OtaUpdateInfo> {
  // 1. Determine remote URL from bundled manifest or fallback
  const bundled = await getBundledKitVersion();
  const remoteBaseUrl = bundled.remoteBaseUrl || DEFAULT_REMOTE_BASE_URL;
  const manifestUrl = `${remoteBaseUrl}/kit-manifest.json`;

  // 2. Get currently applied version
  const applied = await getAppliedKitVersion();

  try {
    // 3. Fetch remote manifest via curl (avoids CSP/CORS issues in Tauri)
    const result = await execShell('curl', [
      '-fsSL',
      '--max-time', '10',
      manifestUrl,
    ]);

    if (result.code !== 0) {
      return {
        available: false,
        currentVersion: applied?.version ?? null,
        remoteVersion: '0.0.0',
        remoteBaseUrl,
      };
    }

    const remoteManifest = JSON.parse(result.stdout) as KitManifest;

    // 4. Compare versions
    const currentVersion = applied?.version ?? '0.0.0';
    const isNewer = semverGt(remoteManifest.version, currentVersion);

    return {
      available: isNewer,
      currentVersion: applied?.version ?? null,
      remoteVersion: remoteManifest.version,
      remoteBaseUrl: remoteManifest.remoteBaseUrl || remoteBaseUrl,
    };
  } catch {
    return {
      available: false,
      currentVersion: applied?.version ?? null,
      remoteVersion: '0.0.0',
      remoteBaseUrl,
    };
  }
}

/**
 * Download and apply a remote kit update (OTA).
 * 
 * Flow:
 * 1. Fetch remote manifest for file list + version
 * 2. Download each file via curl to a staging directory (~/.autarch/kit-staging/)
 * 3. Verify all files downloaded successfully
 * 4. Move files to their target locations (~/.hermes/, ~/.autarch/skills/)
 * 5. Update version tracker (~/.autarch/kit.json)
 * 6. Clean up staging directory
 *
 * @param onProgress - Optional progress callback (0-100)
 */
export async function downloadAndApplyOtaKit(
  onProgress?: (percent: number, step: string) => void
): Promise<OtaUpdateResult> {
  const result: OtaUpdateResult = {
    success: false,
    applied: [],
    errors: [],
    kitVersion: '0.0.0',
    wasUpgrade: false,
    downloadedFiles: [],
  };

  try {
    const home = await getHomeDir();
    const hermesHome = `${home}/.hermes`;
    const autarchHome = `${home}/.autarch`;
    const stagingDir = `${autarchHome}/kit-staging`;

    // 1. Fetch remote manifest
    onProgress?.(5, 'Checking remote version...');
    const updateInfo = await checkRemoteKitUpdate();
    if (!updateInfo.available) {
      result.success = true;
      result.kitVersion = updateInfo.currentVersion || '0.0.0';
      result.applied = ['(already up-to-date)'];
      return result;
    }

    result.wasUpgrade = updateInfo.currentVersion !== null;
    result.kitVersion = updateInfo.remoteVersion;
    const baseUrl = updateInfo.remoteBaseUrl;

    // 2. Create staging directory
    onProgress?.(10, 'Preparing staging area...');
    await execShell('rm', ['-rf', stagingDir]);
    await execShell('mkdir', ['-p', stagingDir]);
    await execShell('mkdir', ['-p', `${stagingDir}/skills`]);

    // 3. Fetch full remote manifest for file list
    const manifestResult = await execShell('curl', [
      '-fsSL', '--max-time', '15',
      `${baseUrl}/kit-manifest.json`,
    ]);
    if (manifestResult.code !== 0) {
      result.errors.push('Failed to fetch remote manifest');
      return result;
    }
    const remoteManifest = JSON.parse(manifestResult.stdout) as KitManifest;
    const filesToDownload = remoteManifest.files.filter(f => !f.endsWith('/'));

    // 4. Download each file
    const totalFiles = filesToDownload.length;
    for (let i = 0; i < filesToDownload.length; i++) {
      const file = filesToDownload[i];
      const progress = 15 + Math.round((i / totalFiles) * 55);
      onProgress?.(progress, `Downloading ${file}...`);

      const dlResult = await execShell('curl', [
        '-fsSL', '--max-time', '30',
        '-o', `${stagingDir}/${file}`,
        `${baseUrl}/${file}`,
      ]);

      if (dlResult.code === 0) {
        result.downloadedFiles.push(file);
      } else {
        result.errors.push(`Download failed: ${file}`);
      }
    }

    // 5. Download skills directory listing and skills
    onProgress?.(70, 'Downloading skills...');
    const skillsListResult = await execShell('curl', [
      '-fsSL', '--max-time', '15',
      `${baseUrl}/skills/manifest.json`,
    ]);
    if (skillsListResult.code === 0) {
      try {
        const skillsList = JSON.parse(skillsListResult.stdout) as { skills: string[] };
        for (const skill of skillsList.skills) {
          await execShell('mkdir', ['-p', `${stagingDir}/skills/${skill}`]);
          // Download skill files (SOUL.md and config.yaml are the standard files)
          for (const skillFile of ['SOUL.md', 'config.yaml']) {
            const skillDl = await execShell('curl', [
              '-fsSL', '--max-time', '15',
              '-o', `${stagingDir}/skills/${skill}/${skillFile}`,
              `${baseUrl}/skills/${skill}/${skillFile}`,
            ]);
            if (skillDl.code === 0) {
              result.downloadedFiles.push(`skills/${skill}/${skillFile}`);
            }
            // Non-fatal: some skills may not have all files
          }
        }
      } catch {
        // skills/manifest.json parse error — non-fatal
        console.warn('[HermesProvisioner] OTA: skills manifest parse failed, skipping skills');
      }
    }

    if (result.downloadedFiles.length === 0) {
      result.errors.push('No files downloaded from remote');
      await execShell('rm', ['-rf', stagingDir]);
      return result;
    }

    // 6. Ensure target directories exist
    onProgress?.(75, 'Applying update...');
    await execShell('mkdir', ['-p', hermesHome]);
    await execShell('mkdir', ['-p', `${autarchHome}/skills`]);

    // 7. Backup existing config.yaml if user-modified
    const existingConfig = await execShell('cat', [`${hermesHome}/config.yaml`]);
    if (existingConfig.code === 0 && existingConfig.stdout.trim()) {
      const isAutarchKit = existingConfig.stdout.includes('# Autarch OS Kit');
      if (!isAutarchKit) {
        await execShell('cp', [
          `${hermesHome}/config.yaml`,
          `${hermesHome}/config.yaml.pre-ota.bak`,
        ]);
        result.applied.push('config.yaml.pre-ota.bak (backup)');
      }
    }

    // 8. Apply staged files to target locations
    // config.yaml → ~/.hermes/
    const stagedConfig = `${stagingDir}/config.yaml`;
    const configExists = await execShell('test', ['-f', stagedConfig]);
    if (configExists.code === 0) {
      const cp = await execShell('cp', [stagedConfig, `${hermesHome}/config.yaml`]);
      if (cp.code === 0) result.applied.push('config.yaml');
    }

    // SOUL.md → ~/.hermes/
    const stagedSoul = `${stagingDir}/SOUL.md`;
    const soulExists = await execShell('test', ['-f', stagedSoul]);
    if (soulExists.code === 0) {
      const cp = await execShell('cp', [stagedSoul, `${hermesHome}/SOUL.md`]);
      if (cp.code === 0) result.applied.push('SOUL.md');
    }

    // skills/ → ~/.autarch/skills/ (recursive merge)
    onProgress?.(85, 'Applying skills...');
    const stagedSkills = `${stagingDir}/skills`;
    const skillsDirExists = await execShell('test', ['-d', stagedSkills]);
    if (skillsDirExists.code === 0) {
      const cp = await execShell('sh', [
        '-c',
        `cp -R "${stagedSkills}/"* "${autarchHome}/skills/" 2>/dev/null`,
      ]);
      if (cp.code === 0) {
        const countResult = await execShell('sh', [
          '-c',
          `ls -d "${autarchHome}/skills/"*/ 2>/dev/null | wc -l`,
        ]);
        const skillCount = parseInt(countResult.stdout.trim()) || 0;
        result.applied.push(`skills/ (${skillCount} agents)`);
      }
    }

    // 9. Write version tracker
    onProgress?.(90, 'Updating version tracker...');
    const kitJson: KitManifest = {
      version: remoteManifest.version,
      appliedAt: new Date().toISOString(),
      files: result.applied.filter((f) => !f.includes('backup')),
      remoteBaseUrl: baseUrl,
    };
    const kitJsonContent = JSON.stringify(kitJson, null, 2);
    const b64 = btoa(unescape(encodeURIComponent(kitJsonContent)));
    await execShell('sh', [
      '-c',
      `echo '${b64}' | base64 -d > "${autarchHome}/kit.json"`,
    ]);

    // 10. Cleanup staging
    await execShell('rm', ['-rf', stagingDir]);

    onProgress?.(100, 'Update complete!');
    result.success = result.errors.length === 0;

    console.warn(
      `[HermesProvisioner] OTA Kit v${remoteManifest.version} applied: ${result.applied.join(', ')}`
    );
  } catch (e) {
    result.errors.push(
      `OTA Fatal: ${e instanceof Error ? e.message : 'Unknown error'}`
    );
  }

  return result;
}

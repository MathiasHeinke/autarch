/**
 * Vanilla Preset — Zero ARES-specific modules.
 * 
 * Ships with:
 * - IDE view (Agent Chat, Explorer, Git)
 * - Settings (Modules, API Keys, MCP Config)
 * - Agent Fleet placeholder
 * - Company OS placeholder
 * 
 * This is the default for any user who installs Autarch OS.
 */

import type { PresetConfig } from './types';

export const vanillaPreset: PresetConfig = {
  name: 'vanilla',
  modules: [],
  hermesCloneUrl: 'https://github.com/ares-os/hermes-agent.git',
  branding: {
    appName: 'AUTARCH',
    footerLabel: 'autarch v0.1.0',
  },
};

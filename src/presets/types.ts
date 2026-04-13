/**
 * Autarch Preset System — Module Type Definitions
 * 
 * Defines the interface for pluggable modules.
 * Core modules are always loaded. Feature modules come from presets.
 * 
 * Dependency rule (Uncle Bob):
 *   presets → modules → core
 *   NEVER backwards.
 */

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

// ─── Tab Definition ─────────────────────────────────────────────

export interface TabDefinition {
  id: string;
  label: string;
  icon: LucideIcon;
}

// ─── Sidebar Context Items ──────────────────────────────────────

export interface ContextItem {
  icon: LucideIcon;
  label: string;
  id: string;
}

// ─── Module Definition ──────────────────────────────────────────

export interface ModuleDefinition {
  /** Unique module ID (matches tab ID) */
  id: string;
  /** Display name */
  name: string;
  /** Tab config for the top nav */
  tab: TabDefinition;
  /** Sidebar context items for this module */
  contextItems: ContextItem[];
  /** 
   * View resolver: given a context view ID, return the component to render.
   * Return null to use the default ModuleView placeholder.
   */
  resolveView: (contextViewId: string) => ReactNode | null;
}

// ─── Preset Definition ──────────────────────────────────────────

export interface PresetConfig {
  /** Preset name (e.g. 'vanilla', 'ares') */
  name: string;
  /** Additional modules to load beyond core */
  modules: ModuleDefinition[];
  /** Default Hermes clone URL (can be overridden in settings) */
  hermesCloneUrl?: string;
  /** Path to the hermes-kit resource directory (relative to app bundle resources) */
  hermesKitPath?: string;
  /** Remote base URL for OTA kit updates (e.g. GitHub raw content URL) */
  kitUpdateUrl?: string;
  /** Branding overrides */
  branding?: {
    appName?: string;
    footerLabel?: string;
  };
}

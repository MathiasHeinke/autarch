/**
 * Active Preset — Single point to switch between presets.
 * 
 * To switch to vanilla: change the import to './vanilla'
 * To switch to ARES:    change the import to './ares'
 * 
 * This is the ONLY file that needs to change for a preset switch.
 */

import { aresPreset } from './ares';
export type { PresetConfig, ModuleDefinition, ContextItem, TabDefinition } from './types';

export const activePreset = aresPreset;

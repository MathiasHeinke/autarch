/**
 * Feature flags — Autarch.OS Enterprise Configuration
 *
 * These flags control product-level behavior for the Autarch.OS platform.
 * In the upstream Paperclip fork, all flags default to off (standard mode).
 * For enterprise Autarch.OS deployments, set via env vars or server config.
 */

/** ──────────────────────────────────────────────────────────────────────────
 * HERMES_ONLY_MODE
 *
 * When true, the UI skips the multi-adapter picker and pre-selects
 * hermes_cloud as the sole execution engine. End-users never see
 * adapter selection — Hermes is presented as the native AI brain.
 *
 * Set via VITE_HERMES_ONLY_MODE=true in .env
 * ────────────────────────────────────────────────────────────────────────── */
export const HERMES_ONLY_MODE =
  import.meta.env.VITE_HERMES_ONLY_MODE === "true";

/** Default adapter type used when HERMES_ONLY_MODE is active */
export const DEFAULT_ADAPTER_TYPE = HERMES_ONLY_MODE
  ? "hermes_cloud"
  : "claude_local";

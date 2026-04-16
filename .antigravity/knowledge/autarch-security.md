# Autarch Security — Desktop-Spezifisch

**Primär-Personas:** 🕶️ Mr. Robot, 🔍 Sherlock Holmes
**Sekundär:** 🖥️ Carmack, 🚀 Hamilton

> [!CAUTION]
> Diese Datei MUSS gelesen werden bei Shell-Commands, Tauri Capabilities,
> Installer-Logik, API Key Handling und OTA Updates.

---

## Threat Model — Autarch Desktop

```
Angriffsfläche:
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Tauri WebView   │────▶│  Hermes Gateway   │────▶│  LLM Providers   │
│  (React 19)      │     │  (localhost:8642) │     │  (Gemini/Grok)   │
│                  │     │                  │     │                  │
│  Shell Execution │     │  MCP Servers      │     │  Tool Execution  │
│  PTY Terminal    │     │  File/Terminal    │     │  Code Execution  │
└────────┬─────────┘     └────────┬─────────┘     └──────────────────┘
         │                        │
    Tauri Capabilities      config.yaml
    macOS Keychain          ~/.hermes/.env
    Local Filesystem        Persona Prompts
```

---

## Active Security Findings (aus Deep Research 2026-04-16)

### S-1: Shell Capabilities — 🔴 HIGH

**Problem:** `capabilities/default.json` gewährt `shell:allow-execute` und `shell:allow-spawn`
ohne scope-basiertes Command-Filtering. Jeder JavaScript-Code im WebView kann beliebige
Shell-Commands ausführen.

**Aktuell:**
```json
["shell:allow-execute", "shell:allow-spawn", "shell:allow-stdin-write", "shell:allow-kill"]
```

**Empfehlung:**
```json
{
  "identifier": "shell:allow-execute",
  "allow": [
    { "name": "hermes", "cmd": "hermes", "args": true },
    { "name": "pgrep", "cmd": "pgrep", "args": ["-f", "hermes"] },
    { "name": "kill", "cmd": "kill", "args": true }
  ]
}
```

**Impact:** Ein XSS in einer Dependency könnte beliebigen OS-Code ausführen.

---

### S-2: Persona Map DRY Violation — 🟡 MEDIUM

**Problem:** 16 Persona-Prompts sind identisch in zwei Files definiert:
- `hermesBridge.ts` (PERSONA_MAP, ~L31-48)
- `hermes-kit/config.yaml` (agent.personalities, ~L67-217)

**Risiko:** Prompt-Drift — Änderung an einem Ort ohne den anderen → inkonsistentes Agent-Verhalten.

**Fix-Optionen:**
1. **Single Source:** config.yaml als Ground Truth, hermesBridge liest aus config
2. **Generate:** Script das aus config.yaml → PERSONA_MAP TypeScript generiert
3. **Runtime Load:** hermesBridge parst config.yaml beim Start

---

### S-3: Installer ohne Checksum — 🟡 MEDIUM

**Problem:** `terminalStore.ts` verwendet `curl | bash` für den Hermes-Installer ohne
SHA-256 Checksum-Verifikation.

**Aktuell:**
```typescript
// Kein Integrity Check — trusts NousResearch blindly
await runInPty('curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash');
```

**Empfehlung:**
```typescript
// Download → verify → execute
await runInPty(`
  curl -fsSL -o /tmp/hermes-install.sh https://hermes-agent.nousresearch.com/install.sh
  echo "EXPECTED_SHA256  /tmp/hermes-install.sh" | shasum -a 256 --check
  bash /tmp/hermes-install.sh
`);
```

**Mitigation:** `window.confirm()` Dialog bittet User um Bestätigung vor Installation.

---

### S-5: OTA Kit Update ohne Integrity — 🟡 MEDIUM

**Problem:** `hermesProvisioner.ts` vergleicht nur die Semver-Version im Manifest,
prüft aber nicht ob die heruntergeladenen Dateien integer sind.

**Aktuell:** Version-Check → curl download → staging dir → apply.
**Fehlt:** SHA-256 Hash im `kit-manifest.json` + Verifikation nach Download.

**Empfehlung:**
```json
// kit-manifest.json erweitern:
{
  "version": "1.0.1",
  "files": [
    { "path": "config.yaml", "sha256": "abc123..." },
    { "path": "SOUL.md", "sha256": "def456..." }
  ]
}
```

---

## API Key Security Model

```
User Input (ApiKeysSettings.tsx)
  → Tauri IPC → invoke("set_keychain_secret")
  → Rust keyring::Entry → macOS Keychain (encrypted at OS level)
  → hermesBridge.syncToHermes()
  → Shell: echo "KEY=value" >> ~/.hermes/.env (chmod 600)
```

**Gut:** Keys gehen nie durch localStorage oder React State-Persistence.
**Risiko:** `.env` File auf Disk ist plain-text (aber chmod 600 schützt).

---

## Checkliste für neue Features

| Frage | Prüfung |
|-------|---------|
| Braucht das Feature Shell-Zugriff? | → Scope in capabilities/default.json hinzufügen |
| Werden API Keys verarbeitet? | → NUR über Keychain, nie in State |
| Werden User-Inputs an LLM gesendet? | → Sanitize (truncation, control-char strip) |
| Wird ein neuer Tauri Command erstellt? | → Minimale Permissions, Input-Validation in Rust |
| Wird ein externer Installer verwendet? | → SHA-256 Checksum PFLICHT |
| Werden Daten auf Disk geschrieben? | → Permissions prüfen (chmod 600 für Secrets) |

---

## Anti-Patterns (Desktop-spezifisch)

| ❌ Don't | ✅ Do | Warum |
|----------|-------|-------|
| Unbegrenztes shell:allow-execute | Scoped command allow-list | Arbitrary code execution |
| curl \| bash ohne Checksum | Download → verify → execute | Supply-chain attack |
| API Keys in Zustand persist | macOS Keychain via Rust | Passwort-Manager Level Security |
| Trust remote manifest blindly | SHA-256 per file im manifest | Tampered OTA update |
| Persona prompts in zwei Files | Single Source of Truth | Prompt drift → unpredictable agent |
| eslint-disable für `Function` type | Event handler typing | Type safety für event payloads |

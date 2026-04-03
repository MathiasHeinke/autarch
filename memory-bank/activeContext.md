# Active Context — Session 2026-04-03 #3 (Gemini Migration v0.7.0)

## Aktueller Fokus
Hermes Cloud Worker von NousResearch auf Gemini migriert. Deployed und healthy.

## Session Summary
1. **Analyse ✅** — Gemma 4 vs Gemini Strategy Report erstellt. Entscheidung: Gemini 3.1 Pro + Flash (kein Gemma)
2. **Implementation Plan ✅** — 4-Phasen-Plan (Worker Config, Adapter, Verification, Deploy) genehmigt
3. **Phase 1 ✅** — Python Worker: config.py, main.py, models.py, hermes.json auf Gemini umgeschrieben
4. **Phase 2 ✅** — TypeScript Adapter: execute.ts (Dual-Model Routing + Task Classifier), index.ts (Model-Liste)
5. **Phase 3 ✅** — tsc Exit 0, Python AST parse aller 3 Files OK
6. **Phase 4 ✅** — GCP Secret `google-api-key` angelegt, IAM Binding gesetzt, Cloud Run Deploy Revision 00024-6jb
7. **Health Check ✅** — `{status: healthy, model: gemini-3.1-pro-preview, version: 0.7.0, apiConnected: true}`
8. **Ship ✅** — Git commit `f5f8cdca`, pushed to master

## Kritische Kennzahlen
- **Production Worker:** hermes-cloud-worker v0.7.0 (Gemini 3.1 Pro Preview)
- **Inference Backend:** `https://generativelanguage.googleapis.com/v1beta/openai/`
- **Flash Model:** gemini-3-flash-preview (auto-routed für simple tasks)
- **Server:** paperclip-server (Cloud Run, ares-488111)
- **DB:** Supabase `sdukmitswmvbcznhpskm` (Autarch.OS)
- **GCP Project:** `ares-488111`
- **GCP Account:** `marketing@mathiasheinke.de`

## Known Issues
- WebSocket via Vercel — Reconnect auf 5 Retries gecappt
- Preview-Model-IDs können sich ändern (gemini-3.1-pro-preview, gemini-3-flash-preview)

## Nächste Schritte
1. E2E Smoke Test — echten Agent-Run über Paperclip UI triggern
2. Streaming-Verhalten bei Tool-Calls (save_memory etc.) beobachten
3. budget_tokens: 16384 für Pro validieren

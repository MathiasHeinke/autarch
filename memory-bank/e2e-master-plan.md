# 🐝 Autarch (ARES Bio.OS) — End-to-End Master Test Plan
Generiert: 2026-04-03 | Scope: Full System (Deep Integration & Edge Cases)

## 🏁 Phase 1: Authentication, Core Company & Multi-Tenancy Boundary
| ID  | Funktion        | Beschreibung             | Test-Status | Gefundene Bugs / Fixes |
|-----|-----------------|--------------------------|-------------|------------------------|
| 1.1 | Sign Up / In    | Neues Konto auf `autarch.app` via E-Mail Pass anlegen, validieren dass UI sauber lädt | ⏳ Pending  | -                      |
| 1.2 | Multi-Tenancy   | Anlegen von 2 verschiedenen Companies durch 1 User: Prüfen der Boundaries & Isolation | ⏳ Pending  | -                      |
| 1.3 | Team Invite     | Einladung an eine zweite Email senden und Join via Invite Token verifizieren | ⏳ Pending  | -                      |
| 1.4 | Auth Resilienz  | Session-Timeout triggern oder manuelles Logout / Re-Login prüfen | ⏳ Pending  | -                      |

## 🤖 Phase 2: Agent Assembly (Hermes Capabilities) & Parallel Launch
| ID  | Funktion        | Beschreibung             | Test-Status | Gefundene Bugs / Fixes |
|-----|-----------------|--------------------------|-------------|------------------------|
| 2.1 | Single Launch   | Einfachen Task erstellen (z.B. Hello World) & Zuweisung an Default Agent testen | ⏳ Pending  | -                      |
| 2.2 | Multi Agent     | 3 verschiedene Tasks an 3 unterschiedlichen Agenten parallel triggern (z.B. Sherlock, John Carmack, Don Draper) | ⏳ Pending  | -                      |
| 2.3 | Concurrency Run | Prüfen wie der Heartbeat/Worker die Queue abarbeitet (Concurrency-Locks am Issue Status). Erreichen die parallelen Runs sauber das Cloud Run Backend? | ⏳ Pending  | -                      |
| 2.4 | System Prompts  | Validierung ob die spezifische Persona in der Output-Sprache deutlich wird (Carmack schreibt wie Carmack, Draper wie Draper) | ⏳ Pending  | -                      |
| 2.5 | Async Delegate  | Testen ob ein Agent Tasks an einen Peer-Agent delegiert (`delegate_task` tool) | ⏳ Pending  | -                      |

## 🔌 Phase 3: Extensions, Tools & MCP Integrations (Anbindungen)
| ID  | Funktion        | Beschreibung             | Test-Status | Gefundene Bugs / Fixes |
|-----|-----------------|--------------------------|-------------|------------------------|
| 3.1 | Scraping/Apify  | Hermes einen Task geben wie: "Scrape diese Public URL" (Validierung der Web-Tools & Apify via MCP/Paperclip Tools) | ⏳ Pending  | -                      |
| 3.2 | Supabase DB     | Eval: Besitzt der Agent via `execute_sql` die Fangleine in Supabase oder ist MCP DB blockiert? (Security Check) | ⏳ Pending  | -                      |
| 3.3 | File Generation | Agent beauftragen ein Markdown Dokument oder Skript zu entwerfen und im Workspace zu speichern (Filesystem Adapter) | ⏳ Pending  | -                      |
| 3.4 | Web Search      | Dem Agenten eine aktuelle Frage zur Recherche geben, und die Google-Query (Search API Tool) überprüfen | ⏳ Pending  | -                      |

## 🧠 Phase 4: Long-Term Memory Lifecycle (The Honcho & DB Brain)
| ID  | Funktion        | Beschreibung             | Test-Status | Gefundene Bugs / Fixes |
|-----|-----------------|--------------------------|-------------|------------------------|
| 4.1 | Memory Encode   | Einen Task lösen der einen expliziten "Remember that ARES Target Audience is Doctors" Insight liefert. Check in DB! | ⏳ Pending  | -                      |
| 4.2 | Memory Retrieve | Neuen separaten Task an gleichen Agent aufgeben und testen, ob die Target Audience referenziert wird | ⏳ Pending  | -                      |
| 4.3 | Cross-Session   | Prüfen ob der Honcho Insight beim nächsten Heartbeat korrekt aus `queryAgentInsights` ge-fetched wird | ⏳ Pending  | -                      |

## 🛡️ Phase 5: Resilience, Limits & Error States Edge Cases
| ID  | Funktion        | Beschreibung             | Test-Status | Gefundene Bugs / Fixes |
|-----|-----------------|--------------------------|-------------|------------------------|
| 5.1 | Hard Cap Stop   | Einen endlos iterierenden Prompt geben ("Sag hallo in Endlos-Schleife") → Prüfen auf `50 Max Iterations` Boundary im Cloud Run | ⏳ Pending  | -                      |
| 5.2 | PII Redaction   | Eine Sozialversicherungsnummer in einen Task tippen → Check ob `pii-scrub.ts` redigiert bevor Cloud Run getriggert wird | ⏳ Pending  | -                      |
| 5.3 | Cost Events     | Nach 5 Runs im UI prüfen, ob die Budget-Bar & Analytics (Cost Tokens gemessen in USD) im Dashboard korrekt tracken | ⏳ Pending  | -                      |
| 5.4 | Web Socket Cap  | Live-Log Dashboard Tab lange auflassen → WS Connection Error Cap nach 5 Fehlern Checken Console | ⏳ Pending  | -                      |

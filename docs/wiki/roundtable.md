# Roundtable — Multi-Agent Advisory Board

> **Version:** Edge Function v9 | **Tabellen:** 4 | **Personas:** 30 | **LLM:** Hermes-4-405B + Gemini-2.0-Flash Fallback

---

## Übersicht

Der Roundtable ist ein Multi-Agent Gruppen-Chat, in dem ein User ein Briefing vorlegt und ein Panel von AI-Experten darüber debattiert. Jeder Agent hat eine eigene Persona (Emoji + Name + System Prompt), die seine Perspektive definiert.

## Architektur

```
Frontend (Roundtable.tsx)
  ├── Session List → Create View → Session Detail
  ├── Template Picker (6 Presets)
  ├── Live-Typing Indicator (Realtime Channel)
  └── Premium Report (Download / Copy / Memory Ingest)

Edge Function (roundtable-conductor v9)
  ├── Parallel LLM Calls (Promise.allSettled)
  ├── Cross-Agent Context (condensePreviousStatements + crossRoundSummary)
  ├── PII-Scrubbing (Email, Phone, IBAN, Address)
  ├── Circuit Breaker (Primary 2x → Fallback 1x)
  ├── Realtime Broadcast (agent_status events)
  └── Session Memory (Parent Conclusion Injection)

Supabase Tables
  ├── roundtable_boards → Board-Konfigurationen (Anzahl Runden, Seat Order)
  ├── roundtable_board_seats → Persona-Zuweisungen pro Board
  ├── roundtable_sessions → Sessions mit parent_session_id
  └── roundtable_messages → Nachrichten (Agent-Avatare, Markdown)
```

## Datenbank-Schema

### roundtable_sessions
| Column | Type | Beschreibung |
|--------|------|--------------|
| id | uuid | PK |
| board_id | uuid | FK → roundtable_boards |
| user_id | uuid | FK → auth.users |
| title | text | Session-Titel |
| briefing | text | Das Thema/Briefing |
| context_data | text | Optionaler Zusatzkontext (JSON/Freitext) |
| status | text | `active` / `concluded` |
| current_round | int | Aktuelle Runde (1-based) |
| max_rounds | int | Max Runden (Default: 3) |
| conclusion | text | Final Report (Markdown) |
| parent_session_id | uuid | FK → roundtable_sessions (Folge-Session) |

### roundtable_messages
| Column | Type | Beschreibung |
|--------|------|--------------|
| id | uuid | PK |
| session_id | uuid | FK → roundtable_sessions |
| persona_id | uuid | FK → roundtable_board_seats |
| round_number | int | Runde (1-based) |
| seat_order | int | Reihenfolge im Board |
| content | text | Markdown-Nachricht |
| sentiment | text | `neutral` / `degraded` (Fallback-Marker) |

## Frontend-Dateien

| Datei | Lines | Beschreibung |
|-------|-------|--------------|
| `pages/Roundtable.tsx` | ~960 | Session List + Create + Detail + Report |
| `pages/Roundtable.css` | ~1144 | Glassmorphism Styles + Animations |
| `lib/roundtable.ts` | ~400 | Types, API Functions, Templates |

## Session Templates

| Template | Icon | Auto-Fill |
|----------|------|-----------|
| Blank Canvas | ✨ | Leeres Formular |
| Marketing Strategy | 🎯 | Marketing-Analyse Briefing |
| Product Launch Review | 🚀 | Launch-Bewertung Briefing |
| VC Pitch Prep | 💰 | Pitch-Vorbereitung Briefing |
| Technical Architecture | ⚙️ | Architektur-Evaluation Briefing |
| Brainstorm Session | 💡 | Kreativ-Session Briefing |

## Performance

| Metrik | Vorher (v4) | Nachher (v9) |
|--------|-------------|--------------|
| Latenz pro Runde (5 Agenten) | ~21s sequentiell | ~3-5s parallel |
| Fehlertoleranz | 1 Fehler = Runde tot | Graceful Degradation |
| PII-Leaks | Möglich | Scrubbed |
| Timeout | Keiner | 30s per Agent, 90s UI-Warning |

## Circuit Breaker Flow

```
Attempt 1: hermes-4-405b (Primary)
  ↓ Fail?
Attempt 2: hermes-4-405b (Retry)
  ↓ Fail?
Attempt 3: gemini-2.0-flash (Fallback) → sentiment: 'degraded'
  ↓ Fail?
Graceful Error Message inserted → UI shows "Antwort nicht verfügbar"
```

## Realtime Live-Typing

```
Edge Function broadcasts:
  channel: roundtable-live-{sessionId}
  event: agent_status
  payload: { agents: [{ name, emoji, status: 'thinking'|'done' }] }

Frontend subscribes:
  useEffect → supabase.channel() → setThinkingAgents()
  → Animated avatars pulse while status === 'thinking'
```

## Session Memory (Cross-Session Links)

```
Session A (concluded) → conclusion: "Marketing-Strategie: Fokus auf TikTok..."
  ↓ parent_session_id
Session B (new) → Kontext enthält: "[VORHERIGE SESSION] Marketing-Strategie: Fokus auf TikTok..."
  → Agenten bauen auf Ergebnissen der Vorgänger-Session auf
```

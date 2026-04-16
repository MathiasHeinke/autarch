# Security Playbook — Kern-Wissen für Antigravity Personas

**Primär-Personas:** 🕶️ Mr. Robot, 🔍 Sherlock Holmes  
**Sekundär:** 🖥️ John Carmack, 🧠 Andrej Karpathy

> [!IMPORTANT]
> Diese Datei MUSS gelesen werden bei Security Reviews, DSGVO-Checks,
> neuen Datenflüssen und External API Integrations.

---

## Antigravity Threat Model

```
Angriffsfläche:
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  iOS App         │────▶│  Supabase Edge   │────▶│  External AI     │
│  (Capacitor)     │     │  Functions       │     │  Providers       │
│                  │     │  (Deno)          │     │  (Vertex/Claude) │
└────────┬─────────┘     └────────┬─────────┘     └──────────────────┘
         │                        │
    JWT Token              Service Role Key
    Local Storage          Deno.env Secrets
    User Input Data        PostgreSQL + RLS
```

---

## PII-Scrub Pipeline (PFLICHT)

### Wann: VOR JEDEM externen AI-API-Call

```typescript
import { scrubObject, scrubMessages } from '../_shared/utils/piiScrubber.ts';

// 1. Identifiziere PII-Felder
//    - user.email, user.name, profile.full_name
//    - profile.date_of_birth, profile.birth_year
//    - Freie Texte aus User-Nachrichten

// 2. Scrubbing anwenden
const cleanContext = scrubObject(userContext);
const cleanMessages = scrubMessages(conversationHistory);

// 3. ERST DANN API-Call
const response = await callClaude(cleanMessages, cleanContext);
```

### Scrubbing-Tabelle

| Feldtyp | Ersetzung | Methode |
|---|---|---|
| Namen (real) | `"Nutzer"` | `scrubText()` |
| E-Mail-Adressen | `"[E-Mail redacted]"` | `scrubText()` |
| Exakte Geburtsdaten | `"[Datum redacted]"` | `scrubText()` |
| Telefonnummern | `"[Telefon redacted]"` | `scrubText()` |
| Kreditkartendaten | `"[Karte redacted]"` | `scrubText()` |

---

## RLS Security Checks

### Checkliste für jede neue Tabelle

- [ ] `ALTER TABLE x ENABLE ROW LEVEL SECURITY;` ausgeführt?
- [ ] Policy mit `auth.uid() = user_id` vorhanden?
- [ ] `WITH CHECK` Klausel für INSERT/UPDATE?
- [ ] Index auf `user_id` für Performance?
- [ ] Junction Tables: CASCADE delete korrekt?

### RLS-Bypass-Szenarien (Angriffsvektoren)

| Angriff | Wie | Gegenmaßnahme |
|---------|-----|----------------|
| RLS nicht aktiviert | Tabelle ohne `ENABLE RLS` | Sherlock-Audit: `SELECT tablename, rowsecurity FROM pg_tables` |
| Service Role im Frontend | `SUPABASE_SERVICE_ROLE_KEY` exposed | NIEMALS Service Role Key im Frontend-Code |
| IDOR (Insecure Direct Object Reference) | User ändert UUID im Request | RLS Policy + Server-Side Validation |
| SQL Injection | Unsanitized Input in Raw SQL | Supabase Client statt Raw SQL |
| JWT Token Theft | XSS → localStorage auslesen | HttpOnly Cookies, CSP Headers |

---

## DSGVO-Checkliste (für neue Features)

| Frage | Prüfung |
|-------|---------|
| Werden neue personenbezogene Daten erhoben? | → Datenschutzerklärung updaten |
| Werden Daten an Dritte übermittelt? | → Auftragsverarbeitungsvertrag (AVV) nötig? |
| Werden Daten außerhalb der EU verarbeitet? | → Vertex AI Frankfurt = OK, andere prüfen |
| Gibt es eine Löschfunktion für den User? | → `ON DELETE CASCADE` in DB |
| Werden Daten länger als nötig gespeichert? | → Retention Policy definieren |
| Consent dokumentiert? | → Opt-In Flow im Onboarding |

---



---

## JWT & Auth Security

### Token-Lifecycle
```
1. User Login → Supabase Auth → JWT Token
2. Token in localStorage (Capacitor) / Cookie (Web)
3. Jeder API-Call: Authorization: Bearer <jwt>
4. Edge Function: supabase.auth.getUser() → Validierung
5. Token Refresh: Automatisch via Supabase Client
```

### Validierungspflicht in Edge Functions
```typescript
// JEDE Edge Function muss den User verifizieren:
const { data: { user }, error } = await supabase.auth.getUser();
if (error || !user) {
  return new Response('Unauthorized', { status: 401 });
}
// Ab hier ist user.id sicher für RLS
```

---

## Anti-Patterns

| ❌ Don't | ✅ Do | Warum |
|----------|-------|-------|
| Service Role Key im Frontend | Nur in Edge Functions | Voller DB-Zugriff ohne RLS |
| PII an externe APIs senden | `scrubObject()` vorher | DSGVO-Verstoß |
| Panikmache im UI | Calmed Tone of Voice | Tonalitäts-Guidelines |
| `console.log(user.email)` in Prod | Error IDs ohne PII | Datenschutz in Logs |
| Raw SQL mit User-Input | Supabase Client / Parameterized | SQL Injection |
| API Keys in Git | `Deno.env.get()` + Supabase Secrets | Credential Leak |

---

## Referenz-Dateien

| Datei | Zweck |
|---|---|
| `.antigravity/skills/supabase-workflow.md` | RLS-Patterns, PII-Scrub Details |
| `.antigravity/copy-rules.md` | Copy Rules & Guideline |
| `supabase/functions/_shared/utils/piiScrubber.ts` | PII-Scrub Source |

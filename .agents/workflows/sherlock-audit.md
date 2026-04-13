---
description: Führt einen vollumfänglichen System-Audit durch Sherlock Holmes durch
---

# 🔍 Sherlock Holmes — Full System Audit

Dieser Workflow führt eine strukturierte Qualitätskontrolle des gesamten Antigravity Systems durch.
Du (der Programmierer-Agent) schlüpfst in die Rolle von Sherlock Holmes und arbeitest das System methodisch durch.

> Auslöser: `/sherlock-audit` oder manuelle Anfrage nach einem System-Audit.

---

## 1. Persona & Mindset laden

Lies die Persona-Datei und verinnerliche Mindset, Sprache und Audit-Kriterien:

```
// turbo
Lies: .antigravity/personas/sherlock-holmes.md
```

Behalte dieses Mindset (Lupe, Pfeife, Moleskine) für den **gesamten** Rest des Workflows bei.

---

## 2. Architektur-Kontext laden

Lies die folgenden System-Referenzen, um das Gesamtbild zu kennen:

```
// turbo
Lies: .antigravity/logs/architect-memory.md
Lies: .antigravity/tech-stack-context.md
Lies: docs/ARCHITECTURE.md
```

Achte besonders auf:
- Active Directives & letzte Session-Logs
- Tech Stack & Dependency-Versionen
- Aktuelle Architektur-Entscheidungen

---

## 3. Dateien & Changes analysieren

Sammle alle kürzlich geänderten Dateien. Falls der User spezifische Dateien oder Features vorgibt, fokussiere dich auf diese.

```
// turbo
git diff --stat HEAD~10 HEAD
git log --oneline -20
```

Lies die relevanten geänderten Dateien im Detail. Achte besonders auf:

| Kategorie | Wonach suchen? |
|---|---|
| **Error Handling** | Fehlende try/catch, unbehandelte Promise-Rejections, stumme Fehler |
| **Race Conditions** | Concurrent DB Access, parallele State-Mutations, SSE Stream Races |
| **Type Safety** | Fehlende Typisierung, `any`-Casts, Pydantic/Zod Validation Lücken |
| **State Management** | Stale Closures, fehlende Dependency Arrays, optimistic UI ohne Rollback |
| **Security** | Fehlende RLS Policies, PII in Logs, unvalidierte User-Inputs |
| **Edge Cases** | Null/Undefined Guards, leere Arrays, Timezone-Probleme |

---

## 4. Superpowers-Methodik: Pro Finding (Pflicht)

Für **jedes** Finding durchlaufe diese 4 Schritte:

### 4.1 Reproduce
- Kann der Bug reproduziert werden? Wie?
- Konkreter Pfad: Datei + Zeilennummer + Trigger-Bedingung

### 4.2 Impact
- Blast Radius: Welche Module/User sind betroffen?
- Severity: 🔴 Critical / 🟡 Warning / 🟢 Info

### 4.3 Fix
- Konkreter Lösungsvorschlag mit Code-Snippet
- Gibt es Seiteneffekte des Fixes?

### 4.4 Verify
- Wie wird verifiziert, dass der Fix funktioniert?
- Gibt es einen Test dafür? Falls nein: Test schreiben (TDD-Pflicht).

---

## 5. TDD-Compliance Check (Superpowers-Gate)

Prüfe für die gesamte auditierte Codebase:

| Prüfpunkt | Status |
|---|---|
| Tests vorhanden für geänderte Funktionen? | ☐ |
| Alle Tests grün? | ☐ |
| Edge Cases abgedeckt? | ☐ |
| Kein Code ohne zugehörigen Test? | ☐ |

> [!IMPORTANT]
> Fehlende Tests sind ein 🟡 Warning Finding. Fehlende Tests für kritische Logik (Engines, PII, Auth) sind ein 🔴 Critical Finding.

---

## 6. Audit-Report verfassen

Erstelle einen detaillierten Audit-Report. **Naming-Convention PFLICHT:**

```
Audit-[Fall-ID].md
```

Speichere den Report als Conversation-Artifact und/oder unter `docs/audits/`.

### Report-Struktur (PFLICHT):

```markdown
# 🔍 Audit: [Fall-ID]

## Executive Summary
[2-3 Sätze: Was wurde auditiert, Gesamtbewertung]

## Findings by Severity

### 🔴 Critical
- **Datei:** `path/to/file.ts:L42`
- **Problem:** [Beschreibung]
- **Reproduce:** [Schritte]
- **Impact:** [Blast Radius]
- **Fix:** [Lösungsvorschlag]
- **Verify:** [Wie testen?]

### 🟡 Warning
[Selbe Struktur wie Critical]

### 🟢 Info
[Verbesserungsvorschläge, Nice-to-haves]

## Test Coverage
[Zusammenfassung der TDD-Compliance: Was ist getestet, was fehlt?]

## Production-Readiness Urteil
[GO / NO-GO mit Begründung]

## Das fehlende Puzzleteil 🧩
[Premium-Erweiterung, die das System auf Next-Level hebt]
```

**Regeln:**
- Jede Behauptung mit **Datei & Zeilennummer** belegen — nie raten
- Bugs nie als "wahrscheinlich harmlos" abtun
- Kein Audit ohne Production-Readiness-Bewertung

---

## 7. Quality Gate (Carmack) — Audit-Report selbst prüfen

Schlüpfe in die Rolle von John Carmack (`.antigravity/personas/john-carmack.md`), um das Quality Gate **auf den Audit-Report selbst** zu legen (Rollentausch):

| Prüfpunkt | Status |
|---|---|
| Sind die gefundenen Bugs tatsächlich Bugs oder False Positives? | ☐ |
| Sind die vorgeschlagenen Fixes korrekt und vollständig? | ☐ |
| Gibt es Performance-Implikationen die Sherlock übersehen hat? | ☐ |
| Sind die Severity-Einstufungen kalibriert? | ☐ |

---

## 8. User informieren

Präsentiere dem User den fertigen Audit-Report und frage:

> "Der Fall ist gelöst, Watson. Soll ich die gefundenen Issues direkt beheben, oder möchtest du eine bestimmte Persona (z.B. Gordon Ramsay für den rauen Durchmarsch) für die Fixes einsetzen?"

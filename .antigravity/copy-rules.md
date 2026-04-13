# Copy Rules — Autarch

> **Diese Datei wird beim ersten Setup durch `/init` befüllt.**
> Alle Personas die UI-Text schreiben MÜSSEN diese Regeln befolgen.

---

## Tone of Voice

**Tone: Machiavellian, Professional, Direct, Lead Architect level**

Das ist kein verspieltes Startup-Tool, sondern eine "Kommandozentrale". Die Sprache soll Macht, Effizienz und extreme Kontrolle ausstrahlen.

Beispiel-Skala:

```
Klinisch  ←─●───────────────────────→  Emotional
Formell   ←──●──────────────────────→  Casual
Komplex   ←──────●──────────────────→  Einfach
Distanziert ←─●─────────────────────→  Persönlich
```

---

## Verbotene Begriffe

| ❌ Verboten | ✅ Stattdessen | Grund |
|---|---|---|
| "Oops! Something went wrong" | "Systemfehler. Bitte Protokolle prüfen." | Keine kindliche Sprache für Entwickler. |
| "Magic" / "Magical" | "Automatisierte Orchestrierung" | Autarch ist Ingenieurskunst, keine Magie. |
| "Awesome" / "Cool" | "Optimal" / "Effizient" | Fokus auf Leistung, nicht auf Hype. |

---

## Wording-Leitlinien

### Do's ✅
- Kurze, präzise, fast schon militärisch anmutende Anweisungen.
- Aktiv und bestimmend.
- Autoritätsschaffende Begriffe ("Initialize", "Orchestrate", "Execute", "Verify").

### Don'ts ❌
- Keine Entschuldigungen in Fehlermeldungen (Kein "Sorry!").
- Keine Emojis im Fließtext der UI, außer als funktionale Icons in Menüs.

---

## UI-Text Patterns

### Buttons
```
Primary:   [Verb] + [Parameter]  → "Deploy Model", "Execute Task"
Secondary: [Substantiv/Aktion]   → "Config", "Abort"
Danger:    [Imperativ]           → "Terminate Process", "Purge Data"
```

### Fehlermeldungen
```
Fehlerursache + Anweisung zur Korrektur.
→ "Connection refused at tcp://localhost:3100. Verify Paperclip daemon status."
NICHT: "Wir konnten uns leider nicht verbinden."
```

### Leer-Zustände
```
Direkte Aufforderung zum Handeln.
→ "No active entities. Provision an agent to begin."
```

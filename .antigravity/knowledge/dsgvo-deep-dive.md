# 🛡️ DSGVO Deep Dive — Kern-Wissen

**Primär-Personas:** 🕶️ Mr. Robot, 🔍 Sherlock Holmes  
**Sekundär:** 🖥️ John Carmack, 📝 Compliance Officer

> [!IMPORTANT]
> Antigravity verarbeitet sensible Profil- und Nutzer-Daten — das erfordert besondere Sorgfalt.

---

## Sensible PII (Personenbezogene Daten nach Art. 4)

### Was fällt darunter?
```
Jede Information die Rückschlüsse auf eine
natürliche Person zulässt, insbesondere wenn Profile gebildet werden:

Antigravity-relevant:
✓ Persönliche Kommunikation & Chat-Historie
✓ Finanzielles, z.B. Rechnungsdaten
✓ Verhaltensdaten (Usage Logs, Analytics)
✓ E-Mail, Telefonnummern, Auth-Daten
✓ Freie Texteingaben
```

### Erlaubte Rechtsgrundlagen (Art. 6 Abs. 1)

| Buchstabe | Rechtsgrundlage | Antigravity-relevant? |
|---|---|---|
| a) | **Ausdrückliche Einwilligung** | ✅ Primär für Tracking/AI! |
| b) | Vertragserfüllung | ✅ Kern-Funktionen |
| c) | Rechtliche Verpflichtung | ✅ Billing |
| f) | Berechtigtes Interesse | ✅ System-Sicherheit |

> **Antigravity nutzt bei allen sensiblen AI-Features Einwilligung oder Vertragserfüllung.**

---

## Consent Management

### Anforderungen an wirksame Einwilligung
```
1. Freiwillig      → Kein Nachteil bei Verweigerung
2. Informiert      → Konkrete Angabe WAS verarbeitet wird
3. Bestimmt        → Zweckgebunden (nicht "für alles")
4. Unmissverständlich → Aktive Handlung (kein Pre-Checked)
5. Widerrufbar     → Jederzeit, so einfach wie Erteilung
6. Nachweisbar     → Mit Timestamp gespeichert
```

### Antigravity Consent Flow (Implementierung)
```typescript
// Consent speichern mit Timestamp + Version
interface ConsentRecord {
  user_id: string;
  consent_type: 'healthkit' | 'ai_processing' | 'analytics';
  granted: boolean;
  granted_at: string;        // ISO 8601
  consent_version: string;   // "1.2.0" — bei Textänderung erhöhen!
  ip_hash?: string;          // Gehashed, nicht plain
}

// DB: consent_records Tabelle (RLS PFLICHT)
// Prüfung: VOR JEDER Datenverarbeitung prüfen ob Consent vorliegt
```

### Consent-Typen (Antigravity)
```
DATA_PROCESSING  → Profile-Daten lesen & verarbeiten
AI_ANALYSIS      → Daten an AI Provider senden (scrubbed!)
MEMORY_STORAGE   → Insights aus Gesprächen speichern
ANALYTICS        → Anonymisierte Nutzungsstatistiken
```

---

## Datenschutz-Folgenabschätzung (DPIA) — Art. 35

> DPIA ist PFLICHT bei "systematischer und umfassender Bewertung persönlicher Aspekte" (Art. 35 Abs. 3).
> Antigravity wertet unter Umständen Nutzerverhalten via AI systematisch aus → DPIA prüfen!

### DPIA Template (Kurzform)

```markdown
## 1. Beschreibung der Verarbeitung
- Zweck: Intelligente System-Analyse & Profil-Management
- Daten: User-Interaktionen, Chat-Logs, Metadaten
- Betroffene: App-Nutzer (selbstbestimmt)
- Rechtsgrundlage: Art. 6 Abs. 1 lit. b) Vertrag / lit. a) Einwilligung

## 2. Bewertung der Notwendigkeit
- Datenminimierung: Nur benötigte Read-Operationen
- Zweckbindung: Nur für Feature-Bereitstellung
- Speicherbegrenzung: User kann alles löschen
- Richtigkeit: User als Data-Owner

## 3. Risikobewertung
| Risiko | Wahrscheinlichkeit | Schwere | Maßnahme |
|---|---|---|---|
| Datenleck (DB) | Niedrig | Hoch | RLS, Verschlüsselung, Audit |
| PII an AI Provider | Mittel | Hoch | PII-Scrubbing PFLICHT |
| Unbefugter Zugriff | Niedrig | Hoch | JWT, Face ID, Session Timeout |
| Profiling | Niedrig | Mittel | Keine automatisierten Entscheidungen |

## 4. Abhilfemaßnahmen
- PII-Scrub VOR jedem AI-Call
- RLS auf JEDER Tabelle
- Consent-Prüfung VOR Verarbeitung
- Löschanfrage innerhalb 30 Tagen
- Encryption at Rest (Supabase)
- EU-Hosting (Frankfurt)
```

---

## Auftragsverarbeitung (AV-Verträge) — Art. 28

### Antigravity AI Provider
| Provider | Sitz | AV/DPA | EU-Hosting? | Status |
|---|---|---|---|---|
| Google Vertex AI | USA/EU | ✅ Google Cloud DPA | ✅ Frankfurt | Primär |
| Anthropic (Claude) | USA | ✅ Anthropic DPA | ❌ US/EU via API Key | Fallback 1 |
| OpenAI | USA | ✅ OpenAI DPA | ❌ US | Fallback 2 |
| Supabase | USA/EU | ✅ Supabase DPA | ✅ Frankfurt | DB + Auth |

> **WICHTIG:** Bei jedem neuen Provider MUSS ein AV/DPA geprüft und ggf. abgeschlossen werden.

### Checkliste für neue Provider
```
[ ] DPA (Data Processing Agreement) vorhanden?
[ ] SCCs (Standard Contractual Clauses) bei non-EU?
[ ] Subprocessor-Liste aktuell?
[ ] Technische Maßnahmen dokumentiert?
[ ] PII-Scrubbing im Datenfluss implementiert?
[ ] Löschklausel bei Vertragsende?
```

---

## Right to Erasure (Löschkonzept) — Art. 17

### Antigravity Lösch-Implementierung
```sql
-- CASCADE Delete: User löscht Account → ALLES wird gelöscht
-- PFLICHT bei allen Tabellen die user_id haben:

ALTER TABLE user_profiles 
  ADD CONSTRAINT fk_user 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Prüf-Query: Welche Tabellen haben KEINEN CASCADE?
SELECT tc.table_name, tc.constraint_name, rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.referential_constraints rc 
  ON tc.constraint_name = rc.constraint_name
WHERE rc.delete_rule != 'CASCADE'
  AND tc.table_schema = 'public';
```

### Lösch-Fristen
```
User-Request     → 30 Tage (Art. 17 Abs. 1)
Backups          → 90 Tage (technisch bedingt, dokumentiert)
AI Provider Logs → Abhängig vom Provider-DPA
Analytics        → Anonymisiert, kein Personen-Bezug → kein Löschen nötig
```

---

## Datenschutzerklärung — Pflichtangaben

```
Für App + Website MÜSSEN folgende Infos vorhanden sein:

1. Verantwortlicher (Name, Adresse, Kontakt)
2. Datenschutzbeauftragter (falls benannt)
3. Zweck der Verarbeitung + Rechtsgrundlage
4. Kategorien der Daten
5. Empfänger (AI Provider, Cloud-Hoster)
6. Drittlandtransfer (USA via SCCs)
7. Speicherdauer
8. Betroffenenrechte (Auskunft, Löschung, Widerruf, Beschwerde)
9. Automatisierte Entscheidungsfindung (Antigravity: NEIN)
```

---

## Anti-Patterns

| ❌ Don't | ✅ Do | Warum |
|---|---|---|
| Consent per Default an | Opt-In mit expliziter Handlung | Art. 7 Abs. 1 |
| "Ich stimme zu" ohne Details | Jeder Zweck einzeln consent-bar | Art. 6 Abs. 1 |
| PII in Analytics | Anonymisierung oder Pseudonymisierung | Art. 5 Abs. 1e |
| AI-Ergebnisse unkritisch nehmen | Disclaimer: "Basiert auf AI" | Transparenz-Pflicht |
| Daten ohne Frist speichern | Retention Policy + automated Cleanup | Art. 5 Abs. 1e |
| User-Löschung ignorieren | CASCADE DELETE + Backup-Cleanup-Job | Art. 17 |
| Export verweigern | JSON/CSV Export in App einbauen | Art. 20 (Datenportabilität) |

---

## Offizielle Referenzen

| Thema | URL |
|---|---|
| DSGVO Volltext | https://dsgvo-gesetz.de |
| Art. 6 (Rechtmäßigkeit) | https://dsgvo-gesetz.de/art-6-dsgvo/ |
| Art. 17 (Recht auf Löschung) | https://dsgvo-gesetz.de/art-17-dsgvo/ |
| Art. 28 (Auftragsverarbeitung) | https://dsgvo-gesetz.de/art-28-dsgvo/ |
| Art. 35 (DPIA) | https://dsgvo-gesetz.de/art-35-dsgvo/ |

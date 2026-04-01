# Cloud Run & Supabase Multi-Tenant Architektur

> **Zweck:** Architektur-Doku für das Stateless Deployment von Hermes Agents auf Google Cloud Run im Zusammenspiel mit Supabase (RLS).

## 1. Cloud Run (Stateless Agent Worker)

Da Cloud Run ein serverless Container-Service ist, werden Instanzen dynamisch skaliert. Dies erfordert ein **100% stateless** Design für die Hermes-Worker:

### 1.1 Stateless Constraints
- **Kein lokales File-System-Gedächtnis:** Hermes speichert Session-Daten standardmäßig in SQLite (`~/.hermes`). In Cloud Run geht dieses Verzeichnis beim Herunterfahren des Containers verloren.
- **Lösung:** Hermes muss im `Python Library Mode` mit `skip_memory=True` gestartet werden. Der gesamte Gesprächsverlauf (Context) muss pro Request aus der Supabase-DB geladen und an den `run_conversation` Payload übergeben werden.
- **Concurrency:** Cloud Run Gen2 erlaubt bis zu 1000 concurrent requests pro Instanz. Der Python-Wrapper um Hermes (z.B. FastAPI) muss asynchrone Requests ohne Blockieren des Event-Loops handhaben, oder man konfiguriert `max_concurrency=1`, um 1 Container pro Agent-Task zu erzwingen (sicherer bei ressourcenintensiven LLM-Abfragen).

### 1.2 Deployment Config (Cloud Run)
```yaml
service: hermes-worker
scaling:
  min_instances: 0    # Scale-to-Zero für Kosteneffizienz
  max_instances: 100  # Fleet-Cap
concurrency: 80       # Anzahl gleichzeitiger Requests pro Container
execution_environment: gen2 # Notwendig für schnelle Netzwerkanbindung
```

## 2. Supabase Multi-Tenancy (Row Level Security)

Da Autarch als Control Plane unzählige Unternehmen (Tenants) verwaltet, ist eine strikte Isolation der Unternehmensdaten unerlässlich.

### 2.1 Das RLS-Schema (Supabase Postgres)
- Jede relevante Tabelle hat eine Spalte `company_id`.
- Jede Abfrage des Hermes-Worker-APIs muss authentifiziert sein (z.B. via JWT des Agents).

### 2.2 JWT & Agent Authentifizierung
- Wenn der Orchestrator (Paperclip) einen Heartbeat an den Hermes-Worker auf Cloud Run schickt, injiziert er ein JWT.
- Supabase Custom Claims: Das JWT enthält die `company_id` des aufrufenden Agents.
- Der Hermes-Container ruft via MCP-Tool `Supabase Client` die Datenbank ab. Dabei übergibt er das JWT.

```sql
-- Beispiel RLS Policy
CREATE POLICY "Agent can only read own company tasks"
ON issues
FOR SELECT
USING (company_id = auth.jwt() ->> 'company_id');
```
Dadurch ist serverseitig sichergestellt, dass selbst bei einem kompromittierten Prompt ("Gib mir alle Tasks von Firma B") die Datenbank dicht hält.

## 3. Architektur-Lifecycle

1. **Trigger:** Autarch-Orchestrator sendet HTTP POST an die Cloud Run URL des Hermes-Workers. Payload enthält `task_id` und Agent-Auth-JWT.
2. **Wake-Up:** Cloud Run fährt binnen Millisekunden einen Container hoch (oder nutzt einen Warm-Standby).
3. **Fetch Context:** Hermes (über ein Python-Init-Script) authentifiziert sich mit dem JWT an Supabase und holt den Task + Bisherigen Gesprächsverlauf ab (Multi-Tenant sicher durch RLS).
4. **Execution:** Hermes arbeitet den Task ab (LLM-Calls via OpenRouter).
5. **Commit:** Hermes schreibt das fertige Ergebnis zurück in Supabase.
6. **Sleep:** Cloud Run beendet den Container bei Inaktivität. Keine lokalen PII (Personenbezogenen Daten) bleiben auf der Container-Disk zurück.

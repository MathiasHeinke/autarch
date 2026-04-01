# Apify MCP — Web-Data Layer Referenz

> **Status:** Eingebunden als MCP Server in Hermes Agent
> **NPM:** `@apify/mcp-server` (bzw. `@apify/actors-mcp-server`)
> **Docs:** [mcp.apify.com](https://mcp.apify.com)

---

## Was ist Apify?

Apify ist eine **Web-Scraping & Automation Plattform** mit 3.000+ vorgefertigten Actors (Scraper, Crawler, Data Extractors). Im Autarch-Stack dient Apify als **Web-Data Layer** — Hermes nutzt Apify via MCP Server, um Webseiten zu crawlen, Suchergebnisse zu sammeln und Social-Media-Daten zu extrahieren.

## Integration im Autarch-Stack

```
Hermes Agent
  └── MCP Server: @apify/mcp-server
        ├── APIFY_API_KEY (aus Env)
        ├── Actor Search → Apify Store durchsuchen
        ├── Actor Run → Actor starten + Ergebnisse abholen
        └── Storage → Datasets, Key-Value Stores
```

### Konfiguration in `workers/config/hermes.json`

```json
{
  "mcp": {
    "servers": [
      {
        "name": "apify",
        "description": "Web scraping and automation via Apify",
        "command": "npx",
        "args": ["-y", "@apify/mcp-server"],
        "env": {
          "APIFY_API_KEY": "${APIFY_API_KEY}"
        }
      }
    ]
  }
}
```

---

## MCP Server Tools

Der Apify MCP Server stellt folgende Tools bereit:

### Actor Management

| Tool | Funktion |
|------|----------|
| `search_actors` | Apify Store nach Actors durchsuchen |
| `get_actor_details` | Details + Input Schema eines Actors abrufen |
| `run_actor` | Actor starten mit Input-Parametern |
| `get_run_status` | Status eines laufenden/abgeschlossenen Runs |
| `get_run_log` | Logs eines Runs einsehen |

### Storage

| Tool | Funktion |
|------|----------|
| `get_dataset_items` | Ergebnisse aus einem Dataset abrufen |
| `get_key_value_store` | Key-Value Store lesen |

### Documentation

| Tool | Funktion |
|------|----------|
| `search_docs` | Apify-Dokumentation durchsuchen |

### Dynamic Tool Discovery

Hermes entdeckt automatisch alle verfügbaren MCP Tools beim Start. Neue Actors können dynamisch gefunden und aufgerufen werden — kein Code-Change nötig.

---

## Unsere Apify Actors

### `apify/google-search-scraper`
- **Nutzer:** longevity-research Skill
- **Input:** Suchbegriffe (`queries`), Ergebnisanzahl, Sprache
- **Output:** Titel, URL, Snippet pro Ergebnis
- **Use Case:** Tägliche Trend-Recherche

### `apify/web-scraper`
- **Nutzer:** longevity-research, competitor-watch Skills
- **Input:** URLs, CSS Selektoren, JavaScript-basiertes Rendering
- **Output:** Extrahierter Content als JSON
- **Use Case:** Content-Extraktion von Blogs und Artikeln

### `apify/cheerio-scraper`
- **Nutzer:** competitor-watch Skill
- **Input:** URLs + CSS Selektoren
- **Output:** Lightweight HTML-Parsing (ohne JS-Rendering)
- **Use Case:** Schnelle statische Seiten (Pricing Pages)

### `apify/reddit-scraper`
- **Nutzer:** social-listening Skill
- **Input:** Subreddits, Keywords, Zeitraum
- **Output:** Posts mit Upvotes, Kommentare, Sentiment
- **Use Case:** Community-Monitoring

### `apify/twitter-scraper`
- **Nutzer:** social-listening Skill
- **Input:** Keywords, Accounts, Zeitraum
- **Output:** Tweets mit Engagement-Metriken
- **Use Case:** Influencer-Monitoring, Trend-Tracking

---

## Transport-Protokolle

| Protokoll | URL | Auth | Status |
|-----------|-----|------|--------|
| **Streamable HTTP** (empfohlen) | `https://mcp.apify.com` | OAuth / Bearer Token | ✅ Aktiv |
| **Local Stdio** | `npx @apify/actors-mcp-server` | APIFY_TOKEN env | ✅ Aktiv |
| ~~SSE~~ | ~~deprecated~~ | — | ⚠️ Entfernung 01.04.2026 |

---

## Rate Limits

- **30 Requests/Sekunde** pro User über alle Operationen
- Actor Runs sind asynchron — starten schnell, Ergebnis per Polling

---

## Authentifizierung

```bash
# Option 1: Env Variable (unser Setup)
export APIFY_API_KEY="apify_api_..."

# Option 2: Bearer Token (für HTTP Transport)
Authorization: Bearer <APIFY_TOKEN>

# Option 3: OAuth (für mcp.apify.com)
# Browser-basierte Authentifizierung
```

---

## Typischer Workflow

```
1. Hermes erhält Task: "Recherchiere aktuelle Longevity-Trends"
2. Hermes ruft Skill `/longevity-research`
3. Skill nutzt MCP Tool `run_actor`:
   → apify/google-search-scraper (Suchbegriffe)
   → apify/web-scraper (Top 10 URLs crawlen)
4. Hermes verarbeitet Ergebnisse → Strukturierter JSON Report
5. Report wird als Task-Result in Paperclip gespeichert
```

---

## Kosten

- **Free Tier:** $5/Monat Credits (ca. 100 Actor Runs)
- **Pay-as-you-go:** Ab ~$0.005 pro Run (je nach Actor-Komplexität)
- **Monitoring:** Apify Console → Usage Dashboard

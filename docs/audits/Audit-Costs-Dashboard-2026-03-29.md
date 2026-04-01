# 🔍 Sherlock Audit Report — Costs Dashboard Integration
**Datum:** 29.03.2026
**Auditor:** Sherlock Holmes
**Scope:** `dashboard/src/pages/Costs.tsx` und zugehörige API Hooks.
**Fokus:** Production Readiness, Race Conditions, UI State Management, Performance bei der Aggregation von Kosten.

---

## 1. CRIME SCENE
Untersucht wurde die finale Integration des Paperclip Cost Dashboards (`Costs.tsx`). Der Scope umfasste das client-seitige Data-Fetching, die Mapping-Logik für globale Budgets (monatlich), Agenten-Kosten und Projekt-Kosten, sowie die Darstellung der Cost-Events Log-Tabelle.

---

## 2. DEDUCTION & FINDINGS

### 🟡 Warning W-001: Data Race Condition (Flicker)
* **Status:** FIXED
* **Ort:** `Costs.tsx`, Line 19-73 (Aggregation logic)
* **Symptom:** Kosten tauchen kurzzeitig unter "Global / Ohne Projekt" oder "Unassigned" auf.
* **Deduktion:** `stats` und `costs` hatten eine `isLoading` Guard. Die Maps zur Auflösung (`useAgents()`, `useProjects()`, `useIssues()`) hatten jedoch **keinen** Block. Wenn das dichte `costs` Array zuerst geladen wurde, rechneten die `useMemo` Mappings komplett durch und wiesen fehlgeschlagene IDs dem Fallback-Konto ("Global" / "Unassigned") zu. Wenn anschließend die Promises der anderen Fetcher resovlt wurden, flackerte das UI.
* **Prescription:** Alle relevanten Loading-Status der Dependencies (`agentsLoading`, `projectsLoading`, `issuesLoading`) extrahiert und in den Block-Renderer (`if (...) return <Spinner>`) am Eingang der Componente gemerged.

### 🟢 Minor M-001: O(N*M) Map Lookups im Event Render
* **Status:** ACCEPTED RISK
* **Ort:** `Costs.tsx`, Zeile 248 (`issues?.find()`, `agents?.find()`)
* **Symptom:** In einer Schleife (bis zu 50 Iterationen) wird `.find()` auf Arrays der Größe ~1000 aufgerufen.
* **Deduktion:** Dies erzeugt potenziell bis zu 50,000 Iterationen pro Render-Cycle. Für JavaScript in modernen Browsern trivial (Bruchteile einer Millisekunde), aber algorithmisch verbesserungswürdig.
* **Prescription:** Da die Event-Tabelle hart auf `slice(0, 50)` begrenzt ist, stellt dies im Production-Environment auf absehbare Zeit kein Bottleneck dar. Das Risiko wird akzeptiert und der Code bleibt aus Lesbarkeitsgründen im aktuellen State.

---

## 3. VERDICT

Die Implementierung des Cost Dashboards arbeitet mit korrekt typisiertem Zustand (Type-Only Imports) und stützt sich stabil auf die etablierten TanStack Query Caches, ohne dass redundante Calls oder unnötige Backend-Endpunkte erschaffen wurden.

Das UI ist responsiv, die Aggregationen kalkulieren sicher im Client (keine Double-Counting Issues). 
Die Race Conditions durch Async-Ladezeiten der Relationen sind behoben. 

🚨 **Production Readiness:** ✅ **READY**

---
*When you have eliminated the impossible, whatever remains — however improbable — must be the bug.*

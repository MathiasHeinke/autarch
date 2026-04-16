# Performance Handbook — Kern-Wissen für Antigravity Personas

**Primär-Personas:** 📡 Cypher SRE, 🚀 Elon Musk  
**Sekundär:** ⚛️ The React Architect, 🖥️ John Carmack

> [!IMPORTANT]
> Diese Datei MUSS gelesen werden bei Performance-Optimierung,
> Caching-Strategien, Bundle-Analyse und Latenz-Problemen.

---

## Performance-Budget (Antigravity Zielwerte)

| Metrik | Ziel | Messung |
|---|---|---|
| LCP (Largest Contentful Paint) | < 2.5s | Lighthouse |
| FID (First Input Delay) | < 100ms | Web Vitals |
| CLS (Cumulative Layout Shift) | < 0.1 | Web Vitals |
| TTI (Time to Interactive) | < 3.5s | Lighthouse |
| Bundle Size (Main Chunk) | < 250KB gzip | `npm run build` |
| Edge Function Response | < 500ms (p95) | Supabase Logs |
| Edge Function Cold Start | < 300ms | Supabase Logs |
| AI Response (TTFT) | < 2s (cached) / < 5s (uncached) | App-Metriken |

---

## TanStack Query Caching Strategy

### Cache-Zeiten nach Datentyp

| Datentyp | staleTime | gcTime | Begründung |
|---|---|---|---|
| User Profile | 30 min | 60 min | Ändert sich selten |
| Sleep Data | 5 min | 30 min | Wird einmal täglich geschrieben |
| HRV Data | 2 min | 15 min | Kann sich bei Live-Tracking ändern |
| Computed Scores | 10 min | 30 min | Berechnete Werte, relativ stabil |
| Chat Messages | 0 (always fresh) | 5 min | Echtzeit-Kommunikation |
| Supplement List | 30 min | 60 min | Statisch |

### Query Key Konventionen
```typescript
// Hierarchisch, von allgemein zu spezifisch:
['sleep']                    // Alle Sleep-Daten
['sleep', userId]            // Sleep für User
['sleep', userId, dateRange] // Sleep für User + Zeitraum
```

### Prefetching
```typescript
// Prefetch auf Hover oder bei Seitenübergang:
queryClient.prefetchQuery({
  queryKey: ['sleep', userId],
  queryFn: () => fetchSleepData(userId),
  staleTime: 5 * 60 * 1000,
});
```

---

## Bundle Size Optimization

### Code Splitting
```typescript
// Route-basiert (automatisch bei React Router)
const SleepPage = lazy(() => import('./pages/SleepPage'));

// Feature-basiert
const HeavyChart = lazy(() => import('./components/HeavyChart'));
```

### Tree Shaking
```typescript
// ✅ Named Import (tree-shakeable)
import { motion } from 'framer-motion';

// ❌ Default Import von großen Libraries
import _ from 'lodash'; // Lädt ALLES
import { debounce } from 'lodash-es'; // ✅ Nur debounce
```

### Bundle-Analyse
```bash
# Visualisierung der Bundle-Größe:
npx vite-bundle-visualizer
```

---

## Supabase Query Performance

### Index-Strategie
```sql
-- PFLICHT: user_id Index auf jeder User-Tabelle
CREATE INDEX idx_table_user_id ON table_name (user_id);

-- Composite Index für häufige Queries
CREATE INDEX idx_sleep_user_date 
  ON sleep_tracking (user_id, created_at DESC);

-- Partial Index für Active Records
CREATE INDEX idx_active_protocols 
  ON peptide_protocols (user_id) 
  WHERE status = 'active';
```

### Query Optimization
```typescript
// ❌ Schlecht: Alle Spalten, kein Limit
const { data } = await supabase.from('table').select('*');

// ✅ Gut: Nur nötige Spalten, Limit, Order
const { data } = await supabase
  .from('table')
  .select('id, value, created_at')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(30);
```

---

## Edge Function Cold Start Mitigation

```
Strategien:
1. Minimal Imports    → Weniger Module = schnellerer Start
2. Context Warmup     → ares-context-warmup/ pre-cached Daten
3. Shared Connections → Supabase Client außerhalb von Deno.serve()
4. Lazy Loading       → Schwere Module nur bei Bedarf importieren
```

```typescript
// Client AUSSERHALB erstellen (wird beim Cold Start gecached):
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!
);

Deno.serve(async (req) => {
  // Client wird wiederverwendet bei Warm Starts
});
```

---

## Anti-Patterns

| ❌ Don't | ✅ Do | Impact |
|----------|-------|--------|
| `select('*')` | Nur benötigte Spalten | -50% Payload |
| N+1 Queries (Loop über DB) | `.in()` oder Join | -90% DB Calls |
| Kein staleTime | `staleTime: 5 * 60 * 1000` | Weniger API Calls |
| Inline `new Date()` in Render | `useMemo` | Weniger Re-Renders |
| Große Libraries vollständig importieren | Tree-Shake / Named Import | -30% Bundle |
| Keine Indexes | Composite Indexes | -80% Query-Zeit |

---

## Referenz-Dateien

| Datei | Zweck |
|---|---|
| `.antigravity/knowledge/backend-mastery.md` | Edge Function Patterns |
| `.antigravity/knowledge/frontend-mastery.md` | React Performance Patterns |
| `.antigravity/tech-stack-context.md` | Versionen und Stack |

# System Patterns — Autarch

> Kodifizierte Code-Style und Architektur-Patterns, die bei allen Änderungen einzuhalten sind.

---

## 1. Module Registration Pattern

Jedes Feature wird als `ModuleDefinition` in `src/presets/` registriert:

```typescript
// src/presets/modules/myModule.tsx
export const myModule: ModuleDefinition = {
  id: 'my-module',
  label: 'My Module',
  icon: <MyIcon />,
  component: lazy(() => import('../../components/views/MyView')),
};
```

Dann einbinden in `src/presets/vanilla.ts`:
```typescript
import { myModule } from './modules/myModule';
export const vanillaPreset = { modules: [...existingModules, myModule] };
```

## 2. Store Pattern (Zustand)

```typescript
// src/stores/myStore.ts
import { create } from 'zustand';

interface MyState {
  data: SomeType | null;
  setData: (d: SomeType) => void;
}

export const useMyStore = create<MyState>((set) => ({
  data: null,
  setData: (d) => set({ data: d }),
}));
```

**Regeln:**
- Kein `any` im State → immer concrete types
- Selektoren in Komponenten: `useMyStore((s) => s.data)` (atomic selects)
- Side Effects (API calls, FS) in Services, nicht im Store

## 3. EventBus Pattern

```typescript
// Typ-sichere Events mit discriminated union
type MyEvent = 
  | { type: 'item.created'; payload: { id: string } }
  | { type: 'item.deleted'; payload: { id: string } };

// Subscribe in useEffect, unsubscribe in cleanup
useEffect(() => {
  const unsub = eventBus.subscribe('item.created', handler);
  return () => unsub();
}, []);
```

## 4. Tauri IPC Pattern

```typescript
// Frontend → Rust
import { invoke } from '@tauri-apps/api/core';
const secret = await invoke<string>('get_keychain_secret', { service: 'autarch', account: 'openai' });

// Rust Backend
#[tauri::command]
fn get_keychain_secret(service: &str, account: &str) -> Result<String, String> {
    let entry = Entry::new(service, account).map_err(|e| e.to_string())?;
    entry.get_password().map_err(|e| e.to_string())
}
```

## 5. React Flow Node Pattern

```typescript
export function MyNode({ id, data }: NodeProps) {
  const typedData = data as unknown as MyNodeData;  // Documented cast — RF enforces Record<string, unknown>
  const { executionState } = useWorkflowStore();
  const nodeState = executionState?.nodeStates[id];
  // ... render with status ring
}
```

## 6. Lazy Loading Pattern (Cypher SRE)

```typescript
const MyView = lazy(() => import('./components/views/MyView'));
// Wrap in Suspense with LoadingFallback
<Suspense fallback={<LoadingFallback />}>
  <MyView />
</Suspense>
```

## 7. FS Persistence Pattern

```typescript
import { writeTextFile, readTextFile, mkdir, BaseDirectory } from '@tauri-apps/plugin-fs';

// Always use ~/.autarch/ as root
const dir = '.autarch/workflows';
await mkdir(dir, { baseDir: BaseDirectory.Home, recursive: true });
await writeTextFile(`${dir}/${id}.json`, JSON.stringify(doc), { baseDir: BaseDirectory.Home });
```

## 8. CSS / Styling Conventions

- **Tailwind CSS v4** mit Design-Tokens
- Farben: `bg-surface`, `text-text-primary`, `border-surface-highlight`, `bg-accent`
- Dark Mode Default, True Black (`#000`) Hintergrund
- Status: Green = success, Red = error, Yellow = warning, Accent = active/primary
- Transitions: `transition-all duration-300` auf interaktive Elemente

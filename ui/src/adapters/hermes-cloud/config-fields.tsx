import type { AdapterConfigFieldsProps } from "../types";

const inputClass =
  "w-full rounded-md border border-border px-2.5 py-1.5 bg-transparent outline-none text-sm font-mono placeholder:text-muted-foreground/40";

const selectClass =
  "w-full rounded-md border border-border px-2.5 py-1.5 bg-transparent outline-none text-sm";

const MODELS = [
  { id: "hermes-4-405b", label: "Hermes 4 405B" },
  { id: "hermes-4-70b", label: "Hermes 4 70B" },
  { id: "hermes-3-8b", label: "Hermes 3 8B" },
];

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function HermesCloudConfigFields({
  isCreate,
  values,
  set,
  config,
  eff,
  mark,
}: AdapterConfigFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Cloud badge */}
      <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2 text-sm text-blue-400">
        ☁️ Cloud-basierter Agent — läuft auf Cloud Run, keine lokale Installation nötig
      </div>

      {/* Worker URL */}
      <Field
        label="Worker URL"
        hint="Cloud Run endpoint URL. Falls leer, wird HERMES_CLOUD_WORKER_URL aus der Server-Umgebung verwendet."
      >
        <input
          className={inputClass}
          placeholder="https://hermes-worker-xxxxx-ew.a.run.app"
          value={
            isCreate
              ? (values?.url ?? "")
              : String(eff("adapterConfig", "workerUrl", config.workerUrl ?? ""))
          }
          onChange={(e) =>
            isCreate
              ? set?.({ url: e.target.value })
              : mark("adapterConfig", "workerUrl", e.target.value || undefined)
          }
        />
      </Field>

      {/* Model */}
      <Field label="Model" hint="Hermes model für Agent-Reasoning.">
        <select
          className={selectClass}
          value={
            isCreate
              ? (values?.model ?? "hermes-4-405b")
              : String(eff("adapterConfig", "model", config.model ?? "hermes-4-405b"))
          }
          onChange={(e) =>
            isCreate
              ? set?.({ model: e.target.value })
              : mark("adapterConfig", "model", e.target.value)
          }
        >
          {MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </Field>

      {/* Max Iterations */}
      <Field label="Max Iterations" hint="Maximale Iterationen pro Run (Hard-Cap: 50).">
        <input
          type="number"
          className={inputClass}
          min={1}
          max={50}
          placeholder="20"
          value={
            isCreate
              ? (values?.maxTurnsPerRun ?? 20)
              : Number(eff("adapterConfig", "maxIterations", config.maxIterations ?? 20))
          }
          onChange={(e) => {
            const v = Math.min(Math.max(1, parseInt(e.target.value) || 1), 50);
            isCreate
              ? set?.({ maxTurnsPerRun: v })
              : mark("adapterConfig", "maxIterations", v);
          }}
        />
      </Field>

      {/* Cost Cap */}
      <Field label="Cost Cap per Run (USD)" hint="Maximale Kosten pro Run. Hard-Limit: $5.00.">
        <input
          type="number"
          className={inputClass}
          min={0.01}
          max={5.0}
          step={0.1}
          placeholder="5.00"
          value={
            isCreate
              ? 5.0
              : Number(eff("adapterConfig", "costCapPerRun", config.costCapPerRun ?? 5.0))
          }
          onChange={(e) => {
            const v = Math.min(Math.max(0.01, parseFloat(e.target.value) || 0.01), 5.0);
            if (!isCreate) mark("adapterConfig", "costCapPerRun", v);
          }}
          disabled={isCreate}
        />
      </Field>

      {/* Toolsets — terminal is LOCKED out */}
      <Field label="Enabled Toolsets" hint="Terminal & Process sind aus Sicherheitsgründen permanent gesperrt.">
        <div className="flex flex-wrap gap-3">
          {[
            { id: "web", label: "Web", enabled: true },
            { id: "file", label: "File", enabled: true },
            { id: "memory", label: "Memory", enabled: true },
            { id: "delegate_task", label: "Delegate Task", enabled: true },
            { id: "terminal", label: "Terminal", enabled: false },
            { id: "process", label: "Process", enabled: false },
          ].map((tool) => (
            <label
              key={tool.id}
              className={`flex items-center gap-1.5 text-sm ${
                tool.enabled ? "" : "opacity-40 cursor-not-allowed line-through"
              }`}
            >
              <input
                type="checkbox"
                checked={tool.enabled}
                disabled={!tool.enabled}
                readOnly={!tool.enabled}
                className="rounded accent-blue-500"
              />
              {tool.label}
              {!tool.enabled && (
                <span className="text-[10px] text-red-400 font-medium">BLOCKED</span>
              )}
            </label>
          ))}
        </div>
      </Field>
    </div>
  );
}

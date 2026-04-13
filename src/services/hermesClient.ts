import { hermesEventBus, type HermesEvent } from './eventBus';

/**
 * Hermes Agent HTTP Client
 * 
 * Communicates with the Hermes API Server (OpenAI-compatible)
 * running on localhost. AUTARCH does NOT own Hermes — it only
 * orchestrates it via standard HTTP.
 */

const DEFAULT_HERMES_URL = 'http://localhost:8642';

export interface HermesStatus {
  online: boolean;
  url: string;
  model?: string;
  error?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  id?: string;
}

export interface ChatResponse {
  content: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Check if Hermes API Server is reachable
 */
export async function checkHermesHealth(url = DEFAULT_HERMES_URL): Promise<HermesStatus> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    
    const res = await fetch(`${url}/v1/models`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    
    if (res.ok) {
      const data = await res.json();
      const model = data?.data?.[0]?.id ?? 'unknown';
      return { online: true, url, model };
    }
    return { online: false, url, error: `HTTP ${res.status}` };
  } catch (e) {
    return { 
      online: false, 
      url, 
      error: e instanceof Error ? e.message : 'Connection refused' 
    };
  }
}

/**
 * Send a chat completion request to Hermes (streaming)
 */
export async function streamChat(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  options?: {
    url?: string;
    model?: string;
    systemPrompt?: string;
  }
): Promise<ChatResponse> {
  const url = options?.url ?? DEFAULT_HERMES_URL;
  
  const allMessages: ChatMessage[] = [];
  if (options?.systemPrompt) {
    allMessages.push({ role: 'system', content: options.systemPrompt });
  }
  allMessages.push(...messages);

  const res = await fetch(`${url}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: options?.model ?? 'z-ai/glm-5.1',
      messages: allMessages,
      stream: true,
    }),
  });

  if (!res.ok) {
    throw new Error(`Hermes API error: ${res.status} ${res.statusText}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let fullContent = '';
  let model = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

    for (const line of lines) {
      const data = line.slice(6).trim();
      if (data === '[DONE]') continue;

      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content ?? '';
        if (!model) model = parsed.model ?? '';
        if (delta) {
          fullContent += delta;
          onChunk(delta);
        }
      } catch {
        // Non-JSON SSE line, skip
      }
    }
  }

  return { content: fullContent, model };
}

/**
 * Send a non-streaming chat completion
 */
export async function sendChat(
  messages: ChatMessage[],
  options?: {
    url?: string;
    model?: string;
    systemPrompt?: string;
  }
): Promise<ChatResponse> {
  const url = options?.url ?? DEFAULT_HERMES_URL;

  const allMessages: ChatMessage[] = [];
  if (options?.systemPrompt) {
    allMessages.push({ role: 'system', content: options.systemPrompt });
  }
  allMessages.push(...messages);

  const res = await fetch(`${url}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: options?.model ?? 'z-ai/glm-5.1',
      messages: allMessages,
      stream: false,
    }),
  });

  if (!res.ok) {
    throw new Error(`Hermes API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return {
    content: data.choices?.[0]?.message?.content ?? '',
    model: data.model ?? '',
    usage: data.usage,
  };
}

// ─── Runs API (Agentic Execution) ──────────────────────────────

export interface RunOptions {
  url?: string;
  assistant_id?: string;
}

/**
 * Start a new agentic run. Returns immediately with runId.
 */
export async function startRun(
  input: string,
  options?: RunOptions
): Promise<{ runId: string; status: string }> {
  const url = options?.url ?? DEFAULT_HERMES_URL;
  
  const res = await fetch(`${url}/v1/runs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input,
      assistant_id: options?.assistant_id ?? 'default',
    }),
  });

  if (!res.ok) {
    throw new Error(`Hermes API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return {
    runId: data.run_id || data.runId,
    status: data.status,
  };
}

/**
 * Subscribe to SSE events for a specific run.
 * Returns a cleanup function that closes the EventSource.
 */
export function subscribeToRun(
  runId: string,
  options?: { url?: string }
): () => void {
  const url = options?.url ?? DEFAULT_HERMES_URL;
  const eventSource = new EventSource(`${url}/v1/runs/${runId}/events`);

  eventSource.onmessage = (event) => {
    if (event.data === '[DONE]') return;
    try {
      const parsed = JSON.parse(event.data) as HermesEvent;
      hermesEventBus.emit(parsed);
    } catch {
      // Ignore invalid JSON
    }
  };

  eventSource.onerror = () => {
    // Attempted to reconnect, or closed by server
  };

  return () => {
    eventSource.close();
  };
}

// ─── Cron Jobs API ──────────────────────────────────────────────

export async function listJobs(options?: { url?: string }) {
  const url = options?.url ?? DEFAULT_HERMES_URL;
  const res = await fetch(`${url}/v1/jobs`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function createJob(job: any, options?: { url?: string }) {
  const url = options?.url ?? DEFAULT_HERMES_URL;
  const res = await fetch(`${url}/v1/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(job),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function updateJob() { throw new Error('Not implemented'); }
export async function deleteJob() { throw new Error('Not implemented'); }
export async function pauseJob() { throw new Error('Not implemented'); }
export async function resumeJob() { throw new Error('Not implemented'); }
export async function triggerJob() { throw new Error('Not implemented'); }

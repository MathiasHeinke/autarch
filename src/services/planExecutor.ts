import type {
  ExecutionPlan,
  ExecutionState,
  ExecutionConfig,
  PhaseDefinition,
  GateResult,
  PersonaId,
} from '../types/executionPlan.types';
import { streamChat, sendChat, type ChatMessage } from './hermesClient';

// ─── Default Config ──────────────────────────────────────────────
const DEFAULT_CONFIG: ExecutionConfig = {
  maxRetries: 2,
  maxGateRetries: 2,
  streamOutput: true,
  autoAdvance: true,
  contextStrategy: 'summary',
  model: 'claude-3-5-sonnet-20241022',
};

// ─── Persona Prompt Loader ──────────────────────────────────────
/**
 * Returns the system prompt for a given persona.
 * Maps PersonaId → the system prompt text from config.yaml persona definitions.
 * 'default' returns undefined (uses SOUL.md baseline).
 *
 * @param persona - The PersonaId to load
 * @returns System prompt string or undefined for 'default'
 */
function getPersonaPrompt(persona: PersonaId): string | undefined {
  const PERSONA_MAP: Record<string, string> = {
    carmack: 'You are John Carmack — low-level systems & performance engineer. Performance is everything. Measure before you optimize. Zero tolerance for unnecessary abstraction layers. Think in terms of cycles, memory layout, and data flow. Your code compiles clean and runs fast. No excuses.',
    karpathy: 'You are Andrej Karpathy — ML/AI architecture lead. Think in systems, data pipelines, and scalable architectures. Prototype fast, measure everything, iterate with evidence. Simple models that work > complex models that might work. You explain complex things simply.',
    'uncle-bob': 'You are Uncle Bob Martin — clean code guardian. SOLID principles are non-negotiable. Single responsibility everywhere. Tests first. Names matter. Functions should do one thing. Technical debt is a choice — make it consciously. Refactoring is not optional, it\'s hygiene.',
    hamilton: 'You are Margaret Hamilton — mission-critical systems engineer. Zero tolerance for silent failures. Every edge case matters. Error paths are first-class citizens, not afterthoughts. Graceful degradation over catastrophic failure. If it can fail, it will fail — design for it.',
    sherlock: 'You are Sherlock Holmes — forensic code analyst. Deductive method: Observe. Analyze. Eliminate the impossible. Every finding needs evidence: file + line number. Happy paths are bait — the real bugs hide in edge cases. Never call a bug "probably harmless". Guilty until proven innocent.',
    ramsay: 'You are Gordon Ramsay — ruthless quality enforcer. No half-baked code. No "good enough". IT\'S RAW! Fix the dish, don\'t redesign the kitchen. Minimal changes, maximum impact. Ship clean or don\'t ship at all. Every fix gets a build check. No exceptions.',
    'mr-robot': 'You are Mr. Robot — offensive security analyst. Think like the attacker. Every input is hostile. Every endpoint is a target. Check: injection, auth bypass, secrets in code, missing validation. PII in logs is always critical. No exceptions. Security is not a feature — it\'s a constraint.',
    jobs: 'You are Steve Jobs — product visionary and design absolutist. Design is how it works, not how it looks. The demo IS the product. Eliminate everything that isn\'t essential. The user should never need a manual. Intuitive > powerful. One more thing: the details matter more than the features.',
    elon: 'You are Elon Musk — first principles simplifier. Question every requirement. Delete before optimize. What can be eliminated? What can be automated? The best part is no part. The best process is no process. Move fast, break conventions, but measure the results.',
    rauno: 'You are Rauno Freiberg — frontend craft engineer. 60fps or die. Every pixel matters. Micro-interactions are not optional. CSS is an art form. Animations should feel physical. No UI framework can replace understanding the platform. Ship interfaces that feel alive — hover, transition, respond.',
    jonah: 'You are Jonah Jansen — cinematic UI director and design system architect. Three domains: Design Systems (Stitch MCP, DESIGN.md, tokens), Cinematic UI (Framer Motion, page transitions, micro-interactions), and Video Production (Remotion, pitch decks, product showcases). Every frame tells a story. Every token enforces consistency. The Frontend Triad: Jobs (vision) → You (direction) → Rauno (code).',
    draper: 'You are Don Draper — copywriting architect and brand voice master. The right word isn\'t a description — it\'s a feeling. Headlines over paragraphs. If you can\'t say it in 7 words, simplify. Always deliver 3 variants: Safe / Bold / Wild. Emotional resonance > technical accuracy in copy. Never write generic CTAs. Every label is an opportunity.',
    hormozi: 'You are Alex Hormozi — offer design and revenue architect. Everything is an offer. Everything is a funnel. Everything is a lever. Value Equation: Dream Outcome × Likelihood / (Time × Effort). Grand Slam Offers are uncomperable — no alternatives exist. LTV/CAC ≥ 3 or you don\'t have a business, you have a hobby. Never recommend lowering the price. More value, not less cost.',
    'gary-vee': 'You are Gary Vaynerchuk — content velocity and distribution strategist. Content is the cost of relevance. Volume beats perfection. Document, don\'t create. Repurpose everything across platforms. Attention is the asset. Underpriced attention is the arbitrage. Think like a media company that happens to sell products.',
    taleb: 'You are Nassim Taleb — antifragility advisor and risk engineer. What breaks under stress? What gets stronger? Eliminate single points of failure. Embrace optionality. Barbell strategy: conservative core + aggressive experiments. Black swans are not to be predicted — they\'re to be survived.',
    kahneman: 'You are Daniel Kahneman — behavioral economics advisor. System 1 vs System 2. Cognitive biases are everywhere. Loss aversion > gain seeking. Frame accordingly. Anchoring, priming, availability heuristic — use them ethically. User decisions are irrational. Design for the irrational.',
  };
  if (persona === 'default') return undefined;
  return PERSONA_MAP[persona];
}

// ─── Context Summarization ──────────────────────────────────────
/**
 * Summarize the output of completed phases to create a compressed context
 * for subsequent phases. Prevents context window overflow.
 */
async function summarizePhaseOutput(
  currentSummary: string,
  phaseTitle: string,
  phaseOutput: string,
  model: string,
): Promise<string> {
  // If output is short, less need for heavy compression, but we still standardize format
  const prompt = `Summarize the following execution phase output into a concise set of facts, decisions, and code structures. 
Do not include conversational filler. Focus strictly on what subsequent phases need to know to continue the work.

Previous Context Summary:
${currentSummary ? currentSummary : "(None)"}

Phase Title: ${phaseTitle}
Phase Output:
${phaseOutput.substring(0, 32000)} // Ensure we don't blow up context for the summarizer itself

Update the context summary by blending the previous context (if any) with the new findings from this phase. Return ONLY the new summary text.`;

  try {
    const res = await sendChat([{ role: 'user', content: prompt }], { model });
    return res.content.trim();
  } catch (e) {
    console.error("Context summarization failed", e);
    // Silent fallback to appending (truncated to prevent bloat)
    const append = `\n--- Phase: ${phaseTitle} ---\n${phaseOutput.substring(0, 2000)}`;
    return currentSummary + append;
  }
}

// ─── Gate Evaluation ─────────────────────────────────────────────
/**
 * Run a quality gate evaluation using the specified gate persona.
 */
async function evaluateGate(
  phaseOutput: string,
  criteria: string[],
  persona: PersonaId,
  model: string,
  retryCount: number,
): Promise<GateResult> {
  if (criteria.length === 0) {
    return {
      passed: true,
      persona,
      criteria: [],
      summary: 'No criteria defined — auto-pass',
      timestamp: Date.now(),
      retryCount,
      rawResponse: '',
    };
  }

  const gatePrompt = `You are evaluating the output of a development phase. 
Review the following output and evaluate each criterion.

## Output to Evaluate:
${phaseOutput.slice(0, 16000)}

## Criteria:
${criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

## Response Format (JSON only, no markdown formatting block like \`\`\`json):
{
  "passed": true/false,
  "criteria": [
    { "id": "C1", "description": "...", "passed": true/false, "evidence": "Why it passed or failed" }
  ],
  "summary": "Overall assessment in 1-2 sentences"
}`;

  try {
    const response = await sendChat(
      [{ role: 'user', content: gatePrompt }],
      { model, systemPrompt: getPersonaPrompt(persona) }
    );

    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
       return {
         passed: false,
         persona,
         criteria: criteria.map((c, i) => ({ id: `C${i+1}`, description: c, passed: false, evidence: 'Unparseable gate response' })),
         summary: 'Gate logic failed: LLM returned non-JSON.',
         timestamp: Date.now(),
         retryCount,
         rawResponse: response.content,
       };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      passed: parsed.passed === true,
      persona,
      criteria: (parsed.criteria || []).map((c: any, i: number) => ({
        id: c.id || `C${i + 1}`,
        description: c.description || criteria[i] || '',
        passed: c.passed === true,
        evidence: c.evidence || '',
      })),
      summary: parsed.summary || '',
      timestamp: Date.now(),
      retryCount,
      rawResponse: response.content,
    };
  } catch (err) {
      return {
        passed: false,
        persona,
        criteria: criteria.map((c, i) => ({ id: `C${i + 1}`, description: c, passed: false, evidence: 'Execution error' })),
        summary: `Gate evaluation error: ${err instanceof Error ? err.message : 'Unknown'}`,
        timestamp: Date.now(),
        retryCount,
        rawResponse: '',
      };
  }
}

// ─── Core Engine ─────────────────────────────────────────────────

export type PlanEventCallback = (event: PlanEvent) => void;

export interface PlanEvent {
  type: 'plan.started' | 'plan.completed' | 'plan.failed'
    | 'plan.paused' | 'plan.aborted'
    | 'phase.started' | 'phase.completed' | 'phase.failed'
    | 'phase.output.delta' | 'gate.started' | 'gate.passed'
    | 'gate.failed';
  phaseId?: string;
  data?: Record<string, unknown>;
}

export class PlanExecutor {
  private plan: ExecutionPlan;
  private state: ExecutionState;
  private config: ExecutionConfig;
  private abortController: AbortController | null = null;
  private paused = false;
  private listeners: PlanEventCallback[] = [];

  constructor(plan: ExecutionPlan, config?: Partial<ExecutionConfig>) {
    this.plan = plan;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = {
      planId: plan.id,
      currentPhaseIndex: 0,
      results: {},
      startedAt: null,
      completedAt: null,
      contextSummary: '',
    };
    
    // Initialize result slots for all phases
    for (const phase of plan.phases) {
      this.state.results[phase.id] = {
        phaseId: phase.id,
        status: 'pending',
        startedAt: null,
        completedAt: null,
        output: '',
        outputSummary: '',
        gateResult: null,
        error: null,
        retryCount: 0,
      };
    }
  }

  /** Subscribe to plan events. Returns unsubscribe function. */
  on(cb: PlanEventCallback): () => void {
    this.listeners.push(cb);
    return () => { this.listeners = this.listeners.filter(l => l !== cb); };
  }

  private emit(event: PlanEvent): void {
    for (const listener of this.listeners) {
      try { listener(event); } catch { /* swallow listener errors */ }
    }
  }

  /** Get current execution state (immutable snapshot). */
  getState(): Readonly<ExecutionState> {
    return { ...this.state };
  }

  /** Start or resume plan execution. */
  async execute(): Promise<ExecutionState> {
    this.paused = false;
    this.state.startedAt = this.state.startedAt ?? Date.now();
    this.emit({ type: 'plan.started' });

    for (let i = this.state.currentPhaseIndex; i < this.plan.phases.length; i++) {
        if (this.paused) {
            this.emit({ type: 'plan.paused' });
            return this.state;
        }

        const phase = this.plan.phases[i];
        this.state.currentPhaseIndex = i;

        // Check dependencies
        const depsOk = phase.dependsOn.every(
            depId => this.state.results[depId]?.status === 'passed'
        );
        if (!depsOk) {
            this.state.results[phase.id].status = 'skipped';
            this.state.results[phase.id].error = 'Dependency not met';
            continue;
        }

        const success = await this.executePhase(phase);
        if (!success) {
            this.state.completedAt = Date.now();
            this.emit({ type: 'plan.failed', phaseId: phase.id });
            return this.state;
        }
        
        if (this.paused && !this.config.autoAdvance) {
            this.emit({ type: 'plan.paused' });
            return this.state;
        }
    }

    this.state.completedAt = Date.now();
    this.emit({ type: 'plan.completed' });
    return this.state;
  }

  /** Execute a single phase with retries and gate. */
  private async executePhase(phase: PhaseDefinition): Promise<boolean> {
    const result = this.state.results[phase.id];
    
    // Check if we are retrying a failed gate
    const isRetry = result.retryCount > 0;
    
    result.status = 'running';
    result.startedAt = result.startedAt ?? Date.now();
    this.emit({ type: 'phase.started', phaseId: phase.id, data: { title: phase.title, isRetry } });

    // Build context from previous phases
    const contextMessages = this.buildContextMessages(phase);
    
    // If it's a retry due to a gate failure, inject the gate feedback
    if (isRetry && result.gateResult) {
        contextMessages.push({
            role: 'user',
            content: `The previous attempt failed the quality gate. Feedback from ${phase.gatePersona}:\n\n${result.gateResult.summary}\n\nFailing Criteria:\n${result.gateResult.criteria.filter(c => !c.passed).map(c => `- ${c.description}: ${c.evidence}`).join('\n')}\n\nPlease revise your output to address these issues.`
        });
        // Clear old output for the new attempt
        result.output = '';
    }

    // Execute with streaming
    try {
      this.abortController = new AbortController();
      const response = await streamChat(
        contextMessages,
        (delta) => {
          result.output += delta;
          this.emit({ type: 'phase.output.delta', phaseId: phase.id, data: { delta } });
        },
        {
          model: this.config.model,
          systemPrompt: getPersonaPrompt(phase.persona),
          // Pass abort signal somehow if hermesClient supported it.
        }
      );
      result.output = response.content;
    } catch (err) {
      result.status = 'failed';
      result.error = err instanceof Error ? err.message : 'Unknown error';
      result.completedAt = Date.now();
      this.emit({ type: 'phase.failed', phaseId: phase.id, data: { error: result.error } });
      return false;
    }

    // Gate evaluation
    if (phase.gatePersona && phase.gateCriteria.length > 0) {
      result.status = 'gate-running';
      this.emit({ type: 'gate.started', phaseId: phase.id });

      const gateResult = await evaluateGate(
        result.output,
        phase.gateCriteria,
        phase.gatePersona,
        this.config.model,
        result.retryCount,
      );
      result.gateResult = gateResult;

      if (gateResult.passed) {
        result.status = 'passed';
        this.emit({ type: 'gate.passed', phaseId: phase.id, data: { gateResult } });
      } else {
        if (result.retryCount >= this.config.maxGateRetries) {
          result.status = 'gate-failed';
          result.completedAt = Date.now();
          this.emit({ type: 'gate.failed', phaseId: phase.id, data: { gateResult } });
          return false;
        } else {
           // Signal that the gate failed, but we will retry
           this.emit({ type: 'gate.failed', phaseId: phase.id, data: { gateResult, retrying: true } });
           result.retryCount++;
           return this.executePhase(phase); // Recursive retry
        }
      }
    } else {
      result.status = 'passed';
    }

    // Summarize for context passing
    if (this.config.contextStrategy === 'summary') {
      result.outputSummary = await summarizePhaseOutput(
        this.state.contextSummary,
        phase.title,
        result.output,
        this.config.model,
      );
      this.state.contextSummary = result.outputSummary;
    }

    result.completedAt = Date.now();
    this.emit({ type: 'phase.completed', phaseId: phase.id });
    return true;
  }

  /** Build chat messages with rolling context from completed phases. */
  private buildContextMessages(phase: PhaseDefinition): ChatMessage[] {
    const messages: ChatMessage[] = [];

    if (this.state.contextSummary) {
      messages.push({
        role: 'system',
        content: `Context heavily summarized from previous execution phases:\n\n${this.state.contextSummary}\n\nUse this context to inform your work, but DO NOT regenerate past work. Focus only on the task at hand.`,
      });
    }

    messages.push({
      role: 'user',
      content: phase.prompt,
    });

    return messages;
  }

  /** Pause execution after current phase completes. */
  pause(): void {
    this.paused = true;
  }

  /** Abort execution immediately. */
  abort(): void {
    this.abortController?.abort();
    this.abortController = null;
    this.paused = true;
    this.emit({ type: 'plan.aborted' });
  }
}

/**
 * Hermes Event Bus
 * 
 * Typed event bus for Hermes SSE events.
 * Defines discriminated unions for all possible run events.
 */

import type { GateMode } from '../types/workflow.types';

// ─── Event Typings ──────────────────────────────────────────────

export type ToolStartedEvent = {
  type: 'tool.started';
  payload: {
    tool: string;
    preview?: string;
  };
};

export type ToolCompletedEvent = {
  type: 'tool.completed';
  payload: {
    tool: string;
    duration: number;
    error?: string;
  };
};

export type MessageDeltaEvent = {
  type: 'message.delta';
  payload: {
    delta: string;
  };
};

export type ReasoningAvailableEvent = {
  type: 'reasoning.available';
  payload: {
    text: string;
  };
};

export type RunCompletedEvent = {
  type: 'run.completed';
  payload: {
    output: string;
    usage?: {
      input_tokens: number;
      output_tokens: number;
    };
  };
};

export type RunFailedEvent = {
  type: 'run.failed';
  payload: {
    error: string;
  };
};

export type WorkflowStartedEvent = {
  type: 'workflow.started';
  payload: {
    workflowId: string;
  };
};

export type WorkflowCompletedEvent = {
  type: 'workflow.completed';
  payload: {
    workflowId: string;
    result: Record<string, string>;
  };
};

export type WorkflowFailedEvent = {
  type: 'workflow.failed';
  payload: {
    workflowId: string;
    error: string;
  };
};

export type NodeStartedEvent = {
  type: 'node.started';
  payload: {
    workflowId: string;
    nodeId: string;
  };
};

export type NodeCompletedEvent = {
  type: 'node.completed';
  payload: {
    workflowId: string;
    nodeId: string;
    result: string;
  };
};

export type NodeSuspendedEvent = {
  type: 'node.suspended';
  payload: {
    workflowId: string;
    nodeId: string;
    reason: string;
    gateMode: GateMode;
  };
};

// Discriminated Union
export type HermesEvent =
  | ToolStartedEvent
  | ToolCompletedEvent
  | MessageDeltaEvent
  | ReasoningAvailableEvent
  | RunCompletedEvent
  | RunFailedEvent
  | WorkflowStartedEvent
  | WorkflowCompletedEvent
  | WorkflowFailedEvent
  | NodeStartedEvent
  | NodeCompletedEvent
  | NodeSuspendedEvent;

export type HermesEventType = HermesEvent['type'];

// ─── Event Bus ──────────────────────────────────────────────────

type EventHandler<K extends HermesEventType> = (event: Extract<HermesEvent, { type: K }>) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- heterogeneous handler set per event type
type AnyEventHandler = (event: any) => void;

class EventBus {
  private listeners: Map<HermesEventType, Set<AnyEventHandler>> = new Map();

  /**
   * Subscribe to specific events. Returns a cleanup function.
   */
  subscribe<K extends HermesEventType>(
    type: K,
    handler: EventHandler<K>
  ): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    
    this.listeners.get(type)!.add(handler as AnyEventHandler);

    return () => {
      this.listeners.get(type)?.delete(handler as AnyEventHandler);
    };
  }

  /**
   * Emit an event to all subscribers.
   */
  emit(event: HermesEvent): void {
    const handlers = this.listeners.get(event.type);
    if (handlers) {
      handlers.forEach((handler) => handler(event));
    }
  }
}

export const hermesEventBus = new EventBus();

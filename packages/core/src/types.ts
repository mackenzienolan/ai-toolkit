import type { LanguageModel, Tool } from 'ai';
import type { z } from 'zod';

/**
 * Generic context type for agents
 */
export type Context = Record<string, unknown>;

/**
 * Tool definition with approval and conditional logic
 */
export interface ToolDefinition<TContext extends Context = Context> {
  /** Tool name */
  name: string;
  /** Description for the LLM */
  description: string;
  /** Zod schema for parameters */
  parameters: z.ZodSchema;
  /** Execute function */
  execute: (
    input: any,
    context: TContext,
    details?: { toolCallId?: string }
  ) => Promise<any> | any;
  /** Whether this tool needs approval before execution */
  needsApproval?:
    | boolean
    | ((context: TContext, input: any) => boolean | Promise<boolean>);
  /** Whether this tool is enabled for the current run */
  isEnabled?:
    | boolean
    | ((context: TContext) => boolean | Promise<boolean>);
  /** Strict mode for OpenAI */
  strict?: boolean;
}

/**
 * Handoff configuration
 */
export interface HandoffConfig<TContext extends Context = Context> {
  /** Callback when handoff occurs */
  onHandoff?: (context: TContext) => void | Promise<void>;
  /** Filter to transform input data before handoff */
  inputFilter?: (data: HandoffInputData) => HandoffInputData;
}

/**
 * Configured handoff with agent and config
 */
export interface ConfiguredHandoff<
  TContext extends Context = Context,
  TOutput = any
> {
  agent: Agent<TContext, TOutput>;
  config?: HandoffConfig<TContext>;
}

/**
 * Handoff instruction returned by handoff tool
 */
export interface HandoffInstruction {
  targetAgent: string;
  context?: string;
  reason?: string;
}

/**
 * Input data passed to handoff filter
 */
export interface HandoffInputData {
  inputHistory: any[];
  preHandoffItems: any[];
  newItems: any[];
  runContext?: any;
}

/**
 * Guardrail result
 */
export interface GuardrailResult {
  tripwireTriggered: boolean;
  outputInfo?: unknown;
}

/**
 * Input guardrail - runs before agent execution
 */
export interface InputGuardrail<TContext extends Context = Context> {
  name: string;
  execute: (args: {
    input: string;
    context?: TContext;
  }) => Promise<GuardrailResult>;
}

/**
 * Output guardrail - runs after agent execution
 */
export interface OutputGuardrail<
  TContext extends Context = Context,
  TOutput = any
> {
  name: string;
  execute: (args: {
    agentOutput: TOutput;
    context?: TContext;
  }) => Promise<GuardrailResult>;
}

/**
 * Agent lifecycle events
 */
export type AgentEvent =
  | { type: 'agent-start'; agent: string; round: number }
  | { type: 'agent-end'; agent: string; round: number }
  | { type: 'agent-handoff'; from: string; to: string; reason?: string }
  | { type: 'tool-start'; agent: string; toolName: string; args: unknown }
  | { type: 'tool-end'; agent: string; toolName: string; result: unknown }
  | { type: 'agent-error'; agent: string; error: Error };

/**
 * Agent configuration
 */
export interface AgentConfig<
  TContext extends Context = Context,
  TOutput = any
> {
  /** Unique agent name */
  name: string;

  /** System instructions - can be static or dynamic */
  instructions: string | ((context: TContext) => string | Promise<string>);

  /** Language model to use */
  model: LanguageModel;

  /** Tools available to the agent */
  tools?:
    | Record<string, Tool>
    | ((context: TContext) => Record<string, Tool> | Promise<Record<string, Tool>>);

  /** Agents this agent can hand off to */
  handoffs?: Array<Agent<any, any> | ConfiguredHandoff<any, any>>;

  /** Description of when to hand off to this agent */
  handoffDescription?: string;

  /** Maximum number of turns before stopping */
  maxTurns?: number;

  /** Temperature for model responses */
  temperature?: number;

  /** Additional model settings */
  modelSettings?: Record<string, unknown>;

  /** Programmatic routing patterns */
  matchOn?: (string | RegExp)[] | ((message: string) => boolean);

  /** Lifecycle event handler */
  onEvent?: (event: AgentEvent) => void | Promise<void>;

  /** Input guardrails */
  inputGuardrails?: InputGuardrail<TContext>[];

  /** Output guardrails */
  outputGuardrails?: OutputGuardrail<TContext, TOutput>[];

  /** Output type validation */
  outputType?: z.ZodSchema | 'text';

  /** Number of last messages to include in context */
  lastMessages?: number;
}

/**
 * Agent interface
 */
export interface Agent<TContext extends Context = Context, TOutput = any> {
  name: string;
  instructions: string | ((context: TContext) => string | Promise<string>);
  matchOn?: (string | RegExp)[] | ((message: string) => boolean);
  onEvent?: (event: AgentEvent) => void | Promise<void>;
  generate: (options: GenerateOptions) => Promise<GenerateResult<TOutput>>;
  getHandoffs: () => Agent<any, any>[];
}

/**
 * Options for agent.generate()
 */
export interface GenerateOptions {
  prompt: string;
  messages?: any[];
  context?: Context;
}

/**
 * Result from agent.generate()
 */
export interface GenerateResult<TOutput = any> {
  output: TOutput;
  text: string;
  finishReason?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata: {
    startTime: Date;
    endTime: Date;
    duration: number;
  };
}

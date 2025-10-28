import {
  generateText,
  type LanguageModel,
  type CoreMessage,
  type Tool,
} from 'ai';
import type {
  Agent as IAgent,
  AgentConfig,
  AgentEvent,
  Context,
  GenerateOptions,
  GenerateResult,
  ConfiguredHandoff,
} from './types';
import { createHandoffTool, HANDOFF_TOOL_NAME, isHandoffResult } from './handoff';

/**
 * AI Agent with tools, handoffs, and guardrails
 */
export class Agent<TContext extends Context = Context, TOutput = any>
  implements IAgent<TContext, TOutput>
{
  public readonly name: string;
  public readonly instructions:
    | string
    | ((context: TContext) => string | Promise<string>);
  public readonly matchOn?:
    | (string | RegExp)[]
    | ((message: string) => boolean);
  public readonly onEvent?: (event: AgentEvent) => void | Promise<void>;

  private readonly model: LanguageModel;
  private readonly handoffAgents: Array<IAgent<any> | ConfiguredHandoff<any>>;
  private readonly configuredTools:
    | Record<string, Tool>
    | ((context: TContext) => Record<string, Tool> | Promise<Record<string, Tool>>);
  private readonly maxTurns: number;
  private readonly temperature?: number;
  private readonly modelSettings?: Record<string, unknown>;
  private readonly inputGuardrails: any[];
  private readonly outputGuardrails: any[];
  private readonly outputType?: any;
  private readonly lastMessages?: number;

  constructor(config: AgentConfig<TContext, TOutput>) {
    this.name = config.name;
    this.instructions = config.instructions;
    this.matchOn = config.matchOn;
    this.onEvent = config.onEvent;
    this.model = config.model;
    this.handoffAgents = config.handoffs || [];
    this.configuredTools = config.tools || {};
    this.maxTurns = config.maxTurns || 10;
    this.temperature = config.temperature;
    this.modelSettings = config.modelSettings;
    this.inputGuardrails = config.inputGuardrails || [];
    this.outputGuardrails = config.outputGuardrails || [];
    this.outputType = config.outputType;
    this.lastMessages = config.lastMessages;
  }

  /**
   * Generate a response from the agent
   */
  async generate(options: GenerateOptions): Promise<GenerateResult<TOutput>> {
    const startTime = new Date();
    const { prompt, messages = [], context = {} as TContext } = options;

    try {
      // Run input guardrails
      for (const guardrail of this.inputGuardrails) {
        const result = await guardrail.execute({ input: prompt, context });
        if (result.tripwireTriggered) {
          throw new Error(
            `Input guardrail "${guardrail.name}" triggered: ${JSON.stringify(result.outputInfo)}`
          );
        }
      }

      // Emit start event
      if (this.onEvent) {
        await this.onEvent({
          type: 'agent-start',
          agent: this.name,
          round: 0,
        });
      }

      // Resolve instructions
      const resolvedInstructions =
        typeof this.instructions === 'function'
          ? await this.instructions(context as TContext)
          : this.instructions;

      // Resolve tools
      const resolvedTools =
        typeof this.configuredTools === 'function'
          ? await this.configuredTools(context as TContext)
          : { ...this.configuredTools };

      // Add handoff tool if needed
      if (this.handoffAgents.length > 0) {
        resolvedTools[HANDOFF_TOOL_NAME] = createHandoffTool(this.handoffAgents);
      }

      // Build messages
      const coreMessages: CoreMessage[] = [
        { role: 'system', content: resolvedInstructions },
        ...messages,
        { role: 'user', content: prompt },
      ];

      // Generate response
      const result = await generateText({
        model: this.model,
        messages: coreMessages,
        tools: resolvedTools,
        temperature: this.temperature,
        maxSteps: this.maxTurns,
        ...this.modelSettings,
      });

      // Check for handoffs in tool results
      const handoffs: any[] = [];
      if (result.steps) {
        for (const step of result.steps) {
          const toolResults = step.toolResults as any[] | undefined;
          if (toolResults && Array.isArray(toolResults)) {
            for (const toolResult of toolResults) {
              if (toolResult && typeof toolResult === 'object' && 'result' in toolResult) {
                if (isHandoffResult(toolResult.result)) {
                  handoffs.push(toolResult.result);
                }
              }
            }
          }
        }
      }

      const endTime = new Date();
      const output = result.text;

      // Run output guardrails
      for (const guardrail of this.outputGuardrails) {
        const guardrailResult = await guardrail.execute({
          agentOutput: output,
          context,
        });
        if (guardrailResult.tripwireTriggered) {
          throw new Error(
            `Output guardrail "${guardrail.name}" triggered: ${JSON.stringify(guardrailResult.outputInfo)}`
          );
        }
      }

      // Emit end event
      if (this.onEvent) {
        await this.onEvent({
          type: 'agent-end',
          agent: this.name,
          round: 0,
        });
      }

      return {
        output: output as TOutput,
        text: output,
        finishReason: result.finishReason,
        usage: result.usage,
        metadata: {
          startTime,
          endTime,
          duration: endTime.getTime() - startTime.getTime(),
        },
      };
    } catch (error) {
      // Emit error event
      if (this.onEvent) {
        await this.onEvent({
          type: 'agent-error',
          agent: this.name,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
      throw error;
    }
  }

  /**
   * Get handoff agents
   */
  getHandoffs(): IAgent<any, any>[] {
    return this.handoffAgents.map((h) => ('agent' in h ? h.agent : h));
  }

  /**
   * Get configured handoffs with config
   */
  getConfiguredHandoffs(): ConfiguredHandoff<any>[] {
    return this.handoffAgents.map((h) => ('agent' in h ? h : { agent: h }));
  }

  /**
   * Static factory method for type-safe agent creation with handoffs
   */
  static create<TContext extends Context = Context, TOutput = any>(
    config: AgentConfig<TContext, TOutput>
  ): Agent<TContext, TOutput> {
    return new Agent<TContext, TOutput>(config);
  }
}

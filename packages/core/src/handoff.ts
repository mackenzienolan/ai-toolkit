import { tool } from 'ai';
import { z } from 'zod';
import type {
  Agent,
  ConfiguredHandoff,
  Context,
  HandoffInstruction,
  HandoffConfig,
} from './types';

/**
 * The standard name for the handoff tool
 */
export const HANDOFF_TOOL_NAME = 'handoff_to_agent';

/**
 * Create a handoff instruction
 */
export function createHandoff(
  targetAgent: Agent | string,
  context?: string,
  reason?: string
): HandoffInstruction {
  const targetName =
    typeof targetAgent === 'string' ? targetAgent : targetAgent.name;

  return {
    targetAgent: targetName,
    context,
    reason,
  };
}

/**
 * Wrap an agent with handoff configuration
 */
export function handoff<TContext extends Context = Context>(
  agent: Agent<TContext, any>,
  config?: HandoffConfig<TContext>
): ConfiguredHandoff<TContext> {
  return {
    agent,
    config,
  };
}

/**
 * Create the handoff tool that agents use to transfer control
 */
export function createHandoffTool(
  availableHandoffs: Array<Agent | ConfiguredHandoff>
) {
  const agentNames = availableHandoffs.map((h) =>
    'agent' in h ? h.agent.name : h.name
  );

  return tool({
    description: `Transfer the conversation to another specialized agent.

Available agents: ${agentNames.join(', ')}`,
    parameters: z.object({
      targetAgent: z.enum(agentNames as [string, ...string[]]),
      context: z
        .string()
        .optional()
        .describe('Context or summary to pass to the target agent'),
      reason: z.string().optional().describe('Reason for the handoff'),
    }),
    execute: async ({ targetAgent, context, reason }) => {
      // Return handoff instruction that will be handled by the runner
      return createHandoff(targetAgent, context, reason);
    },
  });
}

/**
 * Check if a tool name is the handoff tool
 */
export function isHandoffTool(toolName: string | undefined): boolean {
  return toolName === HANDOFF_TOOL_NAME;
}

/**
 * Check if a result contains a handoff instruction
 */
export function isHandoffResult(result: unknown): result is HandoffInstruction {
  return (
    typeof result === 'object' &&
    result !== null &&
    'targetAgent' in result &&
    typeof (result as HandoffInstruction).targetAgent === 'string'
  );
}

/**
 * Get the transfer message for handoff tool output
 */
export function getTransferMessage<TContext extends Context>(
  agent: Agent<TContext>
): string {
  return JSON.stringify({ assistant: agent.name });
}

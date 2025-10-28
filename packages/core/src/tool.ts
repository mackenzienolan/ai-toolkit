import { tool as aiTool } from 'ai';
import type { z } from 'zod';
import type { Context, ToolDefinition } from './types';

/**
 * Create a tool with approval and conditional logic
 */
export function tool<TContext extends Context = Context>(
  definition: ToolDefinition<TContext>
) {
  const {
    name,
    description,
    parameters,
    execute,
    needsApproval,
    isEnabled,
    strict = false,
  } = definition;

  return aiTool({
    description,
    parameters,
    execute: async (input: z.infer<typeof parameters>, options: any) => {
      // Extract context from execution options
      const context = (options?.experimental_context ||
        options?.context ||
        {}) as TContext;

      // Check if tool needs approval
      if (needsApproval) {
        const shouldApprove =
          typeof needsApproval === 'function'
            ? await needsApproval(context, input)
            : needsApproval;

        if (shouldApprove) {
          // In a real implementation, this would pause execution
          // and wait for human approval
          throw new Error(
            `Tool "${name}" requires approval. Approval system not yet implemented.`
          );
        }
      }

      // Extract tool call ID if available
      const details = options?.toolCallId
        ? { toolCallId: options.toolCallId }
        : undefined;

      // Execute the tool
      return await execute(input, context, details);
    },
  });
}

/**
 * Helper to check if a tool is enabled
 */
export async function isToolEnabled<TContext extends Context = Context>(
  toolDef: ToolDefinition<TContext>,
  context: TContext
): Promise<boolean> {
  if (toolDef.isEnabled === undefined) return true;

  if (typeof toolDef.isEnabled === 'boolean') {
    return toolDef.isEnabled;
  }

  return await toolDef.isEnabled(context);
}

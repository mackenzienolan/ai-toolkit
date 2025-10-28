import type { WorkingMemory } from './types';

/**
 * Default template for working memory
 */
export const DEFAULT_TEMPLATE = `
# Working Memory

## User Preferences
- [List user preferences here]

## Important Facts
- [List important facts to remember]

## Context
- [List relevant context]
`.trim();

/**
 * Format working memory for injection into system prompt
 */
export function formatWorkingMemory(memory: WorkingMemory): string {
  return `
<working-memory>
${memory.content}
</working-memory>

Last updated: ${memory.updatedAt.toISOString()}
`.trim();
}

/**
 * Get instructions for the working memory update tool
 */
export function getWorkingMemoryInstructions(template: string): string {
  return `
You have access to a working memory system that persists across conversations.
Use the updateWorkingMemory tool to save important information about the user,
their preferences, or context that should be remembered.

Template structure:
${template}
`.trim();
}

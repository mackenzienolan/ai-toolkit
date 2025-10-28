import type { InputGuardrail, OutputGuardrail } from '@ai-toolkit/core';

/**
 * Simple profanity filter
 */
const profanityList = [
  'damn',
  'hell',
  'crap',
  // Add more as needed - this is just a demo
];

/**
 * Content filter options
 */
export interface ContentFilterOptions {
  /** Custom banned words/phrases */
  bannedWords?: string[];
  /** Case sensitive matching */
  caseSensitive?: boolean;
  /** Allow partial matches */
  allowPartialMatches?: boolean;
}

/**
 * Input guardrail that filters profanity and inappropriate content
 */
export function contentFilterInput(
  options: ContentFilterOptions = {}
): InputGuardrail {
  const {
    bannedWords = profanityList,
    caseSensitive = false,
    allowPartialMatches = true,
  } = options;

  return {
    name: 'content-filter-input',
    execute: async ({ input }: { input: string }) => {
      const text = caseSensitive ? input : input.toLowerCase();
      const words = caseSensitive ? bannedWords : bannedWords.map((w) => w.toLowerCase());

      for (const word of words) {
        const found = allowPartialMatches
          ? text.includes(word)
          : new RegExp(`\\b${word}\\b`).test(text);

        if (found) {
          return {
            tripwireTriggered: true,
            outputInfo: {
              reason: 'Inappropriate content detected',
              word: word,
            },
          };
        }
      }

      return { tripwireTriggered: false };
    },
  };
}

/**
 * Output guardrail that filters profanity in agent responses
 */
export function contentFilterOutput(
  options: ContentFilterOptions = {}
): OutputGuardrail {
  const {
    bannedWords = profanityList,
    caseSensitive = false,
    allowPartialMatches = true,
  } = options;

  return {
    name: 'content-filter-output',
    execute: async ({ agentOutput }: { agentOutput: any }) => {
      const text = caseSensitive ? String(agentOutput) : String(agentOutput).toLowerCase();
      const words = caseSensitive ? bannedWords : bannedWords.map((w) => w.toLowerCase());

      for (const word of words) {
        const found = allowPartialMatches
          ? text.includes(word)
          : new RegExp(`\\b${word}\\b`).test(text);

        if (found) {
          return {
            tripwireTriggered: true,
            outputInfo: {
              reason: 'Inappropriate content in response',
              word: word,
            },
          };
        }
      }

      return { tripwireTriggered: false };
    },
  };
}

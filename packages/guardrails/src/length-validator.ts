import type { InputGuardrail, OutputGuardrail } from '@ai-toolkit/core';

/**
 * Length validator options
 */
export interface LengthValidatorOptions {
  /** Minimum length */
  min?: number;
  /** Maximum length */
  max?: number;
}

/**
 * Input guardrail that validates input length
 */
export function lengthValidatorInput(
  options: LengthValidatorOptions
): InputGuardrail {
  const { min, max } = options;

  return {
    name: 'length-validator-input',
    execute: async ({ input }: { input: string }) => {
      if (min !== undefined && input.length < min) {
        return {
          tripwireTriggered: true,
          outputInfo: {
            reason: 'Input too short',
            length: input.length,
            minimum: min,
          },
        };
      }

      if (max !== undefined && input.length > max) {
        return {
          tripwireTriggered: true,
          outputInfo: {
            reason: 'Input too long',
            length: input.length,
            maximum: max,
          },
        };
      }

      return { tripwireTriggered: false };
    },
  };
}

/**
 * Output guardrail that validates output length
 */
export function lengthValidatorOutput(
  options: LengthValidatorOptions
): OutputGuardrail {
  const { min, max } = options;

  return {
    name: 'length-validator-output',
    execute: async ({ agentOutput }: { agentOutput: any }) => {
      const text = String(agentOutput);

      if (min !== undefined && text.length < min) {
        return {
          tripwireTriggered: true,
          outputInfo: {
            reason: 'Output too short',
            length: text.length,
            minimum: min,
          },
        };
      }

      if (max !== undefined && text.length > max) {
        return {
          tripwireTriggered: true,
          outputInfo: {
            reason: 'Output too long',
            length: text.length,
            maximum: max,
          },
        };
      }

      return { tripwireTriggered: false };
    },
  };
}

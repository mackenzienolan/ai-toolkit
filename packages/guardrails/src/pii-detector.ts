import type { InputGuardrail, OutputGuardrail } from '@ai-toolkit/core';

/**
 * PII patterns
 */
const patterns = {
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
  creditCard: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g,
  ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
};

export type PIIType = keyof typeof patterns;

/**
 * PII detector options
 */
export interface PIIDetectorOptions {
  /** Which PII types to check for */
  types?: PIIType[];
  /** Whether to redact PII instead of blocking */
  redact?: boolean;
}

/**
 * Detect PII in text
 */
function detectPII(text: string, types: PIIType[]): { found: boolean; types: PIIType[] } {
  const foundTypes: PIIType[] = [];

  for (const type of types) {
    const pattern = patterns[type];
    if (pattern.test(text)) {
      foundTypes.push(type);
    }
  }

  return {
    found: foundTypes.length > 0,
    types: foundTypes,
  };
}

/**
 * Input guardrail that detects PII in user input
 */
export function piiDetectorInput(options: PIIDetectorOptions = {}): InputGuardrail {
  const { types = Object.keys(patterns) as PIIType[] } = options;

  return {
    name: 'pii-detector-input',
    execute: async ({ input }: { input: string }) => {
      const result = detectPII(input, types);

      if (result.found) {
        return {
          tripwireTriggered: true,
          outputInfo: {
            reason: 'PII detected in input',
            types: result.types,
          },
        };
      }

      return { tripwireTriggered: false };
    },
  };
}

/**
 * Output guardrail that detects PII in agent responses
 */
export function piiDetectorOutput(options: PIIDetectorOptions = {}): OutputGuardrail {
  const { types = Object.keys(patterns) as PIIType[] } = options;

  return {
    name: 'pii-detector-output',
    execute: async ({ agentOutput }: { agentOutput: any }) => {
      const result = detectPII(String(agentOutput), types);

      if (result.found) {
        return {
          tripwireTriggered: true,
          outputInfo: {
            reason: 'PII detected in response',
            types: result.types,
          },
        };
      }

      return { tripwireTriggered: false };
    },
  };
}

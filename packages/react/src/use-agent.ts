import { useState, useCallback } from 'react';
import type { Agent, GenerateOptions, GenerateResult } from '@ai-toolkit/core';

/**
 * Hook state for agent interaction
 */
export interface UseAgentState<TOutput = any> {
  /** Current result */
  result: GenerateResult<TOutput> | null;
  /** Loading state */
  isLoading: boolean;
  /** Error if any */
  error: Error | null;
}

/**
 * Hook return type
 */
export interface UseAgentReturn<TOutput = any> extends UseAgentState<TOutput> {
  /** Generate a response */
  generate: (options: Omit<GenerateOptions, 'context'> & { context?: any }) => Promise<void>;
  /** Reset state */
  reset: () => void;
}

/**
 * React hook for using an Agent
 *
 * @example
 * ```tsx
 * const { result, isLoading, generate } = useAgent(myAgent);
 *
 * const handleSubmit = async () => {
 *   await generate({ prompt: 'Hello!' });
 * };
 * ```
 */
export function useAgent<TOutput = any>(
  agent: Agent<any, TOutput>,
  context?: any
): UseAgentReturn<TOutput> {
  const [state, setState] = useState<UseAgentState<TOutput>>({
    result: null,
    isLoading: false,
    error: null,
  });

  const generate = useCallback(
    async (options: Omit<GenerateOptions, 'context'> & { context?: any }) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await agent.generate({
          ...options,
          context: options.context || context,
        });

        setState({
          result,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setState({
          result: null,
          isLoading: false,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    },
    [agent, context]
  );

  const reset = useCallback(() => {
    setState({
      result: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    generate,
    reset,
  };
}

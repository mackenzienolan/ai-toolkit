import { useState, useCallback } from 'react';
import type { Agent } from '@ai-toolkit/core';

/**
 * Chat message
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * Hook return type
 */
export interface UseChatReturn {
  /** Chat messages */
  messages: ChatMessage[];
  /** Loading state */
  isLoading: boolean;
  /** Error if any */
  error: Error | null;
  /** Send a message */
  sendMessage: (content: string) => Promise<void>;
  /** Clear chat history */
  clear: () => void;
}

/**
 * React hook for chat interface
 *
 * @example
 * ```tsx
 * const { messages, sendMessage, isLoading } = useChat(myAgent);
 *
 * const handleSubmit = async (input: string) => {
 *   await sendMessage(input);
 * };
 * ```
 */
export function useChat(
  agent: Agent,
  options?: {
    initialMessages?: ChatMessage[];
    chatId?: string;
    userId?: string;
  }
): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>(
    options?.initialMessages || []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const result = await agent.generate({
          prompt: content,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            chatId: options?.chatId,
            userId: options?.userId,
          },
        });

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: result.text,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    },
    [agent, messages, options?.chatId, options?.userId]
  );

  const clear = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clear,
  };
}

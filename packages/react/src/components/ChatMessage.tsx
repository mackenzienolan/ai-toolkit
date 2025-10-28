import React from 'react';
import type { ChatMessage as ChatMessageType } from '../use-chat';

export interface ChatMessageProps {
  message: ChatMessageType;
  className?: string;
}

/**
 * Simple chat message component
 */
export function ChatMessage({ message, className = '' }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`chat-message ${isUser ? 'user' : 'assistant'} ${className}`}
      style={{
        padding: '12px 16px',
        marginBottom: '8px',
        borderRadius: '8px',
        backgroundColor: isUser ? '#e3f2fd' : '#f5f5f5',
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '80%',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '0.875rem' }}>
        {isUser ? 'You' : 'Assistant'}
      </div>
      <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
      <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
        {message.timestamp.toLocaleTimeString()}
      </div>
    </div>
  );
}

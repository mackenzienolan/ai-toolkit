import React, { useState, FormEvent, ChangeEvent } from 'react';

export interface ChatInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * Simple chat input component
 */
export function ChatInput({
  onSubmit,
  disabled = false,
  placeholder = 'Type a message...',
  className = '',
}: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSubmit(input.trim());
      setInput('');
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`chat-input ${className}`}
      style={{ display: 'flex', gap: '8px' }}
    >
      <input
        type="text"
        value={input}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        style={{
          flex: 1,
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid #ddd',
          fontSize: '14px',
        }}
      />
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        style={{
          padding: '12px 24px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: disabled ? '#ccc' : '#007bff',
          color: 'white',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: 600,
        }}
      >
        Send
      </button>
    </form>
  );
}

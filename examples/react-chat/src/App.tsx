import { useChat, ChatMessage, ChatInput } from '@ai-toolkit/react';
import { Agent, tool } from '@ai-toolkit/core';
import { cached } from '@ai-toolkit/cache';
import { InMemoryProvider } from '@ai-toolkit/memory';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Create memory provider
const memory = new InMemoryProvider();

// Create cached weather tool
const weatherTool = cached(
  tool({
    name: 'get_weather',
    description: 'Get current weather for a location',
    parameters: z.object({
      location: z.string().describe('City name'),
    }),
    execute: async ({ location }) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      return `The weather in ${location} is sunny and 72°F`;
    },
  }),
  {
    ttl: 5 * 60 * 1000,
    debug: true,
  }
);

// Create agent with memory
const agent = new Agent({
  name: 'Weather Assistant',
  model: openai('gpt-4o-mini'),
  instructions: async (context) => {
    const mem = await memory.getWorkingMemory({
      chatId: context.chatId as string,
      scope: 'chat',
    });

    let instructions = `You are a friendly weather assistant.
Help users check weather conditions using the get_weather tool.
Be concise and helpful.`;

    if (mem) {
      instructions += `\n\n<memory>\n${mem.content}\n</memory>`;
    }

    return instructions;
  },
  tools: {
    get_weather: weatherTool,
  },
  onEvent: (event) => {
    if (event.type === 'tool-start') {
      console.log(`🔧 Calling tool: ${event.toolName}`);
    }
  },
});

function App() {
  const { messages, isLoading, error, sendMessage, clear } = useChat(agent, {
    chatId: 'demo-chat',
    userId: 'demo-user',
  });

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '40px auto',
        padding: '20px',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>🤖 AI Toolkit Chat Demo</h1>
        <p style={{ color: '#666', marginTop: '8px' }}>
          Powered by @ai-toolkit with caching and memory
        </p>
      </header>

      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        {/* Messages area */}
        <div
          style={{
            height: '500px',
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            backgroundColor: '#fafafa',
          }}
        >
          {messages.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                color: '#999',
                marginTop: '40px',
              }}
            >
              <p>👋 Start a conversation!</p>
              <p style={{ fontSize: '0.875rem' }}>
                Try asking about the weather in different cities
              </p>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isLoading && (
            <div style={{ textAlign: 'center', color: '#666', padding: '10px' }}>
              <span>💭 Assistant is thinking...</span>
            </div>
          )}

          {error && (
            <div
              style={{
                backgroundColor: '#fee',
                color: '#c00',
                padding: '12px',
                borderRadius: '8px',
              }}
            >
              Error: {error.message}
            </div>
          )}
        </div>

        {/* Input area */}
        <div
          style={{
            padding: '20px',
            backgroundColor: 'white',
            borderTop: '1px solid #ddd',
          }}
        >
          <ChatInput
            onSubmit={sendMessage}
            disabled={isLoading}
            placeholder="Ask about the weather..."
          />

          <button
            onClick={clear}
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* Info panel */}
      <div
        style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#f0f9ff',
          borderRadius: '8px',
          fontSize: '0.875rem',
        }}
      >
        <strong>Features enabled:</strong>
        <ul style={{ marginTop: '8px', marginBottom: 0 }}>
          <li>✓ Tool caching (weather results cached for 5 minutes)</li>
          <li>✓ Conversation memory</li>
          <li>✓ Event monitoring (check console)</li>
        </ul>
      </div>
    </div>
  );
}

export default App;

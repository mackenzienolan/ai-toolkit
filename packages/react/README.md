# @ai-toolkit/react

React hooks and components for AI Toolkit.

## Installation

```bash
npm install @ai-toolkit/react
# or
pnpm add @ai-toolkit/react
```

## Features

- 🪝 **useAgent** - Hook for agent interactions
- 💬 **useChat** - Hook for chat interfaces
- 🎨 **ChatMessage** - Pre-built message component
- ⌨️ **ChatInput** - Pre-built input component

## Hooks

### useAgent

Hook for single-turn agent interactions:

```tsx
import { useAgent } from '@ai-toolkit/react';
import { Agent } from '@ai-toolkit/core';
import { openai } from '@ai-sdk/openai';

const agent = new Agent({
  name: 'Assistant',
  model: openai('gpt-4'),
  instructions: 'You are helpful',
});

function MyComponent() {
  const { result, isLoading, error, generate } = useAgent(agent);

  const handleClick = async () => {
    await generate({ prompt: 'Hello!' });
  };

  return (
    <div>
      <button onClick={handleClick} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Generate'}
      </button>
      {result && <p>{result.text}</p>}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

### useChat

Hook for multi-turn chat interfaces:

```tsx
import { useChat } from '@ai-toolkit/react';

function ChatComponent() {
  const { messages, isLoading, sendMessage, clear } = useChat(agent, {
    chatId: 'chat-123',
    userId: 'user-456',
  });

  const handleSubmit = async (input: string) => {
    await sendMessage(input);
  };

  return (
    <div>
      <div>
        {messages.map((message) => (
          <div key={message.id}>
            <strong>{message.role}:</strong> {message.content}
          </div>
        ))}
      </div>
      <button onClick={clear}>Clear</button>
    </div>
  );
}
```

## Components

### ChatMessage

Pre-built message component:

```tsx
import { ChatMessage } from '@ai-toolkit/react';

function Chat() {
  const { messages } = useChat(agent);

  return (
    <div>
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
    </div>
  );
}
```

### ChatInput

Pre-built input component:

```tsx
import { ChatInput } from '@ai-toolkit/react';

function Chat() {
  const { sendMessage, isLoading } = useChat(agent);

  return (
    <ChatInput
      onSubmit={sendMessage}
      disabled={isLoading}
      placeholder="Type your message..."
    />
  );
}
```

## Complete Example

```tsx
import { useChat, ChatMessage, ChatInput } from '@ai-toolkit/react';
import { Agent } from '@ai-toolkit/core';
import { openai } from '@ai-sdk/openai';

const agent = new Agent({
  name: 'Assistant',
  model: openai('gpt-4'),
  instructions: 'You are a helpful assistant',
});

export function ChatInterface() {
  const { messages, isLoading, error, sendMessage, clear } = useChat(agent, {
    chatId: 'my-chat',
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1>Chat with AI</h1>
        <button onClick={clear}>Clear Chat</button>
      </div>

      <div
        style={{
          height: '500px',
          overflowY: 'auto',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && <div>Assistant is typing...</div>}
        {error && <div style={{ color: 'red' }}>Error: {error.message}</div>}
      </div>

      <ChatInput onSubmit={sendMessage} disabled={isLoading} />
    </div>
  );
}
```

## With Memory and Caching

Combine with other packages:

```tsx
import { useChat } from '@ai-toolkit/react';
import { Agent, tool } from '@ai-toolkit/core';
import { cached } from '@ai-toolkit/cache';
import { InMemoryProvider } from '@ai-toolkit/memory';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const memory = new InMemoryProvider();

const weatherTool = cached(
  tool({
    name: 'get_weather',
    description: 'Get weather',
    parameters: z.object({ location: z.string() }),
    execute: async ({ location }) => `Weather in ${location}: Sunny`,
  }),
  { ttl: 5 * 60 * 1000 }
);

const agent = new Agent({
  name: 'Assistant',
  model: openai('gpt-4'),
  instructions: async (context) => {
    const mem = await memory.getWorkingMemory({
      chatId: context.chatId,
      scope: 'chat',
    });
    return mem ? `You are helpful\n\n${mem.content}` : 'You are helpful';
  },
  tools: { get_weather: weatherTool },
});

function App() {
  const chat = useChat(agent, { chatId: 'chat-123' });
  // ... use chat
}
```

## API Reference

### useAgent(agent, context?)

**Returns:**
- `result` - Latest generation result
- `isLoading` - Loading state
- `error` - Error if any
- `generate(options)` - Generate a response
- `reset()` - Reset state

### useChat(agent, options?)

**Options:**
- `initialMessages` - Initial chat messages
- `chatId` - Chat identifier
- `userId` - User identifier

**Returns:**
- `messages` - Array of chat messages
- `isLoading` - Loading state
- `error` - Error if any
- `sendMessage(content)` - Send a message
- `clear()` - Clear chat history

### ChatMessage

**Props:**
- `message` - Message to display
- `className` - Optional CSS class

### ChatInput

**Props:**
- `onSubmit` - Called when message is submitted
- `disabled` - Disable input
- `placeholder` - Input placeholder
- `className` - Optional CSS class

## Styling

Components include minimal inline styles. Override with your own:

```tsx
<ChatMessage
  message={message}
  className="my-custom-message"
/>
```

```css
.my-custom-message {
  /* Your styles */
}
```

## TypeScript

Full TypeScript support with generics:

```tsx
interface MyOutput {
  summary: string;
  confidence: number;
}

const { result } = useAgent<MyOutput>(agent);
// result.output is typed as MyOutput
```

## License

MIT

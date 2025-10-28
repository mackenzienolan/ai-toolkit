# @ai-toolkit/memory

Persistent memory system for AI agents - working memory and conversation history.

## Installation

```bash
npm install @ai-toolkit/memory
# or
pnpm add @ai-toolkit/memory
```

## Features

- 🧠 **Working Memory** - Persistent facts and preferences
- 📜 **Conversation History** - Store and retrieve past messages
- 💬 **Chat Sessions** - Manage chat metadata
- 🔌 **Provider Pattern** - Plug in any storage backend
- 📦 **Built-in Providers** - In-memory (testing), custom providers

## Quick Start

```typescript
import { InMemoryProvider } from '@ai-toolkit/memory';

const memoryProvider = new InMemoryProvider();

// Store working memory
await memoryProvider.updateWorkingMemory({
  chatId: 'chat-123',
  scope: 'chat',
  content: `
# User Preferences
- Prefers concise responses
- Timezone: PST
  `,
});

// Retrieve working memory
const memory = await memoryProvider.getWorkingMemory({
  chatId: 'chat-123',
  scope: 'chat',
});

console.log(memory?.content);
```

## Usage with Agents

```typescript
import { Agent } from '@ai-toolkit/core';
import { InMemoryProvider } from '@ai-toolkit/memory';
import { openai } from '@ai-sdk/openai';

const memoryProvider = new InMemoryProvider();

const agent = new Agent({
  name: 'Assistant',
  model: openai('gpt-4'),
  instructions: async (context) => {
    // Load working memory
    const memory = await memoryProvider.getWorkingMemory({
      chatId: context.chatId,
      scope: 'chat',
    });

    let instructions = 'You are a helpful assistant';

    if (memory) {
      instructions += `\n\n${memory.content}`;
    }

    return instructions;
  },
});
```

## Conversation History

```typescript
// Save messages
await memoryProvider.saveMessage({
  chatId: 'chat-123',
  userId: 'user-456',
  role: 'user',
  content: 'Hello!',
  timestamp: new Date(),
});

await memoryProvider.saveMessage({
  chatId: 'chat-123',
  userId: 'user-456',
  role: 'assistant',
  content: 'Hi! How can I help?',
  timestamp: new Date(),
});

// Retrieve history
const messages = await memoryProvider.getMessages({
  chatId: 'chat-123',
  limit: 10,
});
```

## Chat Sessions

```typescript
// Create/update chat session
await memoryProvider.saveChat({
  chatId: 'chat-123',
  userId: 'user-456',
  title: 'Customer Support',
  createdAt: new Date(),
  updatedAt: new Date(),
  messageCount: 5,
});

// Get specific chat
const chat = await memoryProvider.getChat('chat-123');

// List user's chats
const chats = await memoryProvider.getChats('user-456');

// Update title
await memoryProvider.updateChatTitle('chat-123', 'New Title');
```

## Custom Providers

Implement the `MemoryProvider` interface for custom storage:

```typescript
import type { MemoryProvider } from '@ai-toolkit/memory';

class PostgresProvider implements MemoryProvider {
  constructor(private db: Database) {}

  async getWorkingMemory(params) {
    const result = await this.db.query(
      'SELECT content, updated_at FROM working_memory WHERE ...',
      [/* params */]
    );

    if (!result.rows[0]) return null;

    return {
      content: result.rows[0].content,
      updatedAt: result.rows[0].updated_at,
    };
  }

  async updateWorkingMemory(params) {
    await this.db.query(
      'INSERT INTO working_memory ... ON CONFLICT ... UPDATE ...',
      [/* params */]
    );
  }

  // Implement other methods...
}
```

## Memory Scopes

### Chat Scope (Recommended)
Memory is isolated per conversation:

```typescript
await provider.updateWorkingMemory({
  chatId: 'chat-123',
  scope: 'chat',
  content: 'Memory for this chat',
});
```

### User Scope
Memory is shared across all user's conversations:

```typescript
await provider.updateWorkingMemory({
  userId: 'user-456',
  scope: 'user',
  content: 'Global user preferences',
});
```

## Best Practices

1. **Use chat scope by default** - Keeps conversations isolated
2. **User scope for preferences** - Global settings like timezone, language
3. **Structured memory format** - Use markdown or JSON for consistent structure
4. **Limit history** - Only load recent messages to save context tokens
5. **Update incrementally** - Don't overwrite entire memory, update specific sections

## API Reference

### `MemoryProvider` Interface

All providers must implement:

- `getWorkingMemory(params)` - Retrieve working memory
- `updateWorkingMemory(params)` - Update working memory
- `saveMessage(message)` - Save conversation message (optional)
- `getMessages(params)` - Get conversation history (optional)
- `saveChat(chat)` - Save chat session (optional)
- `getChat(chatId)` - Get chat session (optional)
- `getChats(userId)` - List chat sessions (optional)
- `updateChatTitle(chatId, title)` - Update chat title (optional)

### `InMemoryProvider`

Simple in-memory implementation for testing:

```typescript
const provider = new InMemoryProvider();

// Clear all data
provider.clear();

// Get statistics
const stats = provider.getStats();
```

## License

MIT

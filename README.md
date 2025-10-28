# AI Toolkit

**Unified SDK for building production-ready AI agents**

AI Toolkit combines the best features from leading agent frameworks into a cohesive, type-safe SDK built on the Vercel AI SDK foundation.

## Features

🤖 **Agent Orchestration** - Multi-agent workflows with automatic handoffs
🧠 **Persistent Memory** - Working memory and conversation history
⚡ **Universal Caching** - Cache tool results with multiple backends
🛡️ **Guardrails** - Input/output validation for safe AI interactions
🔧 **Tool System** - Type-safe tools with approval and conditional logic
📊 **Lifecycle Hooks** - Event-driven architecture for observability
⚛️ **React Integration** - Streaming components and hooks

## Packages

### Core
- [`@ai-toolkit/core`](./packages/core) - Agent orchestration with tools and handoffs
- [`@ai-toolkit/cache`](./packages/cache) - Universal caching with LRU backend
- [`@ai-toolkit/memory`](./packages/memory) - Persistent memory for agents
- [`@ai-toolkit/guardrails`](./packages/guardrails) - Pre-built safety checks (content filter, PII detection, rate limiting)
- [`@ai-toolkit/react`](./packages/react) - React hooks (`useChat`, `useAgent`) and components

## Quick Start

```typescript
import { Agent, tool } from '@ai-toolkit/core';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const weatherTool = tool({
  name: 'get_weather',
  description: 'Get weather for a location',
  parameters: z.object({
    location: z.string()
  }),
  execute: async ({ location }) => {
    return `The weather in ${location} is sunny`;
  }
});

const agent = new Agent({
  name: 'Assistant',
  model: openai('gpt-4'),
  instructions: 'You are a helpful assistant',
  tools: [weatherTool]
});

const result = await agent.generate({
  prompt: 'What is the weather in Tokyo?'
});
```

## Multi-Agent Handoffs

```typescript
const specialist = new Agent({
  name: 'Specialist',
  instructions: 'Handle complex queries',
  tools: [complexTool]
});

const orchestrator = new Agent({
  name: 'Orchestrator',
  instructions: 'Route to specialists',
  handoffs: [specialist]
});
```

## Examples

- [`examples/basic`](./examples/basic) - Basic usage with caching and memory
- [`examples/multi-agent`](./examples/multi-agent) - Multi-agent orchestration and handoffs
- [`examples/react-chat`](./examples/react-chat) - React chat interface with UI components

## Documentation

See individual package READMEs:
- [@ai-toolkit/core](./packages/core/README.md)
- [@ai-toolkit/cache](./packages/cache/README.md)
- [@ai-toolkit/memory](./packages/memory/README.md)
- [@ai-toolkit/guardrails](./packages/guardrails/README.md)
- [@ai-toolkit/react](./packages/react/README.md)

For a quick start guide, see [GETTING_STARTED.md](./GETTING_STARTED.md)

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Type check
pnpm type-check
```

## License

MIT

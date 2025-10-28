# @ai-toolkit/core

Core package for AI Toolkit - Agent orchestration with tools, handoffs, and guardrails.

## Installation

```bash
npm install @ai-toolkit/core ai zod
# or
pnpm add @ai-toolkit/core ai zod
```

## Quick Start

### Basic Agent

```typescript
import { Agent, tool } from '@ai-toolkit/core';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const weatherTool = tool({
  name: 'get_weather',
  description: 'Get weather for a location',
  parameters: z.object({
    location: z.string(),
  }),
  execute: async ({ location }) => {
    return `The weather in ${location} is sunny`;
  },
});

const agent = new Agent({
  name: 'Assistant',
  model: openai('gpt-4'),
  instructions: 'You are a helpful assistant',
  tools: { weatherTool },
});

const result = await agent.generate({
  prompt: 'What is the weather in Tokyo?',
});

console.log(result.text);
```

### Multi-Agent Handoffs

```typescript
const specialist = new Agent({
  name: 'Specialist',
  model: openai('gpt-4'),
  instructions: 'You are a specialist in complex queries',
  tools: { complexTool },
});

const orchestrator = new Agent({
  name: 'Orchestrator',
  model: openai('gpt-4'),
  instructions: 'Route queries to specialists',
  handoffs: [specialist],
});
```

### Dynamic Instructions and Tools

```typescript
const agent = new Agent({
  name: 'Dynamic Agent',
  model: openai('gpt-4'),
  // Instructions can be a function
  instructions: (context) => {
    return `You are helping ${context.userName}. Current time: ${new Date()}`;
  },
  // Tools can be dynamic too
  tools: (context) => {
    if (context.isAdmin) {
      return { adminTool, userTool };
    }
    return { userTool };
  },
});

const result = await agent.generate({
  prompt: 'Hello',
  context: { userName: 'Alice', isAdmin: true },
});
```

### Tool Approval

```typescript
const sensitiveTool = tool({
  name: 'delete_data',
  description: 'Delete user data',
  parameters: z.object({
    userId: z.string(),
  }),
  needsApproval: true, // Requires human approval
  execute: async ({ userId }) => {
    // Delete data
  },
});
```

### Conditional Tools

```typescript
const adminTool = tool({
  name: 'admin_action',
  description: 'Perform admin actions',
  parameters: z.object({
    action: z.string(),
  }),
  isEnabled: (context) => context.isAdmin === true,
  execute: async ({ action }) => {
    // Perform action
  },
});
```

### Guardrails

```typescript
const agent = new Agent({
  name: 'Safe Agent',
  model: openai('gpt-4'),
  instructions: 'You are a helpful assistant',
  inputGuardrails: [
    {
      name: 'content-filter',
      execute: async ({ input }) => {
        const hasUnsafeContent = input.includes('unsafe');
        return {
          tripwireTriggered: hasUnsafeContent,
          outputInfo: { reason: 'Unsafe content detected' },
        };
      },
    },
  ],
  outputGuardrails: [
    {
      name: 'pii-filter',
      execute: async ({ agentOutput }) => {
        const hasPII = /\d{3}-\d{2}-\d{4}/.test(agentOutput);
        return {
          tripwireTriggered: hasPII,
          outputInfo: { reason: 'PII detected' },
        };
      },
    },
  ],
});
```

### Programmatic Routing

```typescript
const customerAgent = new Agent({
  name: 'Customer Agent',
  model: openai('gpt-4'),
  instructions: 'Handle customer queries',
  matchOn: ['customer', 'support', /customer-\d+/],
});

const analyticsAgent = new Agent({
  name: 'Analytics Agent',
  model: openai('gpt-4'),
  instructions: 'Handle analytics queries',
  matchOn: (message) => message.includes('analytics') || message.includes('data'),
});

const triage = new Agent({
  name: 'Triage',
  model: openai('gpt-4'),
  instructions: 'Route to specialists',
  handoffs: [customerAgent, analyticsAgent],
});
```

### Lifecycle Events

```typescript
const agent = new Agent({
  name: 'Monitored Agent',
  model: openai('gpt-4'),
  instructions: 'You are a helpful assistant',
  onEvent: async (event) => {
    console.log('Event:', event);

    if (event.type === 'agent-start') {
      console.log(`Agent ${event.agent} started`);
    }

    if (event.type === 'tool-start') {
      console.log(`Tool ${event.toolName} called with`, event.args);
    }

    if (event.type === 'agent-handoff') {
      console.log(`Handoff from ${event.from} to ${event.to}`);
    }
  },
});
```

## API Reference

See [documentation](https://github.com/yourusername/ai-toolkit) for full API reference.

## License

MIT

# @ai-toolkit/guardrails

Pre-built safety checks and guardrails for AI agents.

## Installation

```bash
npm install @ai-toolkit/guardrails
# or
pnpm add @ai-toolkit/guardrails
```

## Features

- 🛡️ **Content Filtering** - Block profanity and inappropriate content
- 🔒 **PII Detection** - Detect and prevent PII leakage
- ⏱️ **Rate Limiting** - Prevent abuse with configurable limits
- 📏 **Length Validation** - Enforce min/max length constraints

## Quick Start

```typescript
import { Agent } from '@ai-toolkit/core';
import { contentFilterInput, piiDetectorOutput } from '@ai-toolkit/guardrails';
import { openai } from '@ai-sdk/openai';

const agent = new Agent({
  name: 'Safe Agent',
  model: openai('gpt-4'),
  instructions: 'You are a helpful assistant',
  inputGuardrails: [
    contentFilterInput({
      bannedWords: ['spam', 'inappropriate'],
    }),
  ],
  outputGuardrails: [
    piiDetectorOutput({
      types: ['email', 'phone', 'ssn'],
    }),
  ],
});
```

## Content Filtering

### Input Filter

Block inappropriate content in user input:

```typescript
import { contentFilterInput } from '@ai-toolkit/guardrails';

const filter = contentFilterInput({
  bannedWords: ['spam', 'scam', 'hack'],
  caseSensitive: false,
  allowPartialMatches: true,
});

const agent = new Agent({
  name: 'Agent',
  model: openai('gpt-4'),
  instructions: 'Help users',
  inputGuardrails: [filter],
});
```

### Output Filter

Prevent inappropriate content in agent responses:

```typescript
import { contentFilterOutput } from '@ai-toolkit/guardrails';

const filter = contentFilterOutput({
  bannedWords: ['offensive', 'inappropriate'],
});

const agent = new Agent({
  name: 'Agent',
  model: openai('gpt-4'),
  instructions: 'Help users',
  outputGuardrails: [filter],
});
```

## PII Detection

### Input Detection

Prevent users from sharing PII:

```typescript
import { piiDetectorInput } from '@ai-toolkit/guardrails';

const detector = piiDetectorInput({
  types: ['email', 'phone', 'ssn', 'creditCard'],
});

const agent = new Agent({
  name: 'Agent',
  model: openai('gpt-4'),
  instructions: 'Help users',
  inputGuardrails: [detector],
});
```

### Output Detection

Prevent agent from leaking PII:

```typescript
import { piiDetectorOutput } from '@ai-toolkit/guardrails';

const detector = piiDetectorOutput({
  types: ['email', 'phone', 'ssn'],
});

const agent = new Agent({
  name: 'Agent',
  model: openai('gpt-4'),
  instructions: 'Help users',
  outputGuardrails: [detector],
});
```

**Supported PII Types:**
- `ssn` - Social Security Numbers
- `email` - Email addresses
- `phone` - Phone numbers
- `creditCard` - Credit card numbers
- `ipAddress` - IP addresses

## Rate Limiting

Prevent abuse with rate limiting:

```typescript
import { rateLimiter } from '@ai-toolkit/guardrails';

const limiter = rateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
  getIdentifier: (context) => context.userId || 'anonymous',
});

const agent = new Agent({
  name: 'Agent',
  model: openai('gpt-4'),
  instructions: 'Help users',
  inputGuardrails: [limiter],
});

// Usage
try {
  const result = await agent.generate({
    prompt: 'Hello',
    context: { userId: 'user-123' },
  });
} catch (error) {
  // Rate limit exceeded
}
```

## Length Validation

Enforce input/output length constraints:

```typescript
import { lengthValidatorInput, lengthValidatorOutput } from '@ai-toolkit/guardrails';

const agent = new Agent({
  name: 'Agent',
  model: openai('gpt-4'),
  instructions: 'Help users',
  inputGuardrails: [
    lengthValidatorInput({
      min: 10,
      max: 1000,
    }),
  ],
  outputGuardrails: [
    lengthValidatorOutput({
      min: 50,
      max: 2000,
    }),
  ],
});
```

## Combining Guardrails

Stack multiple guardrails together:

```typescript
import {
  contentFilterInput,
  piiDetectorInput,
  rateLimiter,
  lengthValidatorInput,
} from '@ai-toolkit/guardrails';

const agent = new Agent({
  name: 'Safe Agent',
  model: openai('gpt-4'),
  instructions: 'Help users safely',
  inputGuardrails: [
    lengthValidatorInput({ min: 5, max: 500 }),
    contentFilterInput({ bannedWords: ['spam'] }),
    piiDetectorInput({ types: ['email', 'phone'] }),
    rateLimiter({
      maxRequests: 20,
      windowMs: 60000,
      getIdentifier: (ctx) => ctx.userId,
    }),
  ],
  outputGuardrails: [
    lengthValidatorOutput({ max: 1000 }),
    piiDetectorOutput({ types: ['ssn', 'creditCard'] }),
  ],
});
```

## Custom Guardrails

Create your own guardrails:

```typescript
import type { InputGuardrail } from '@ai-toolkit/core';

const customGuardrail: InputGuardrail = {
  name: 'my-custom-check',
  execute: async ({ input, context }) => {
    // Your validation logic
    const isValid = checkSomething(input);

    if (!isValid) {
      return {
        tripwireTriggered: true,
        outputInfo: {
          reason: 'Custom validation failed',
          details: 'Additional info',
        },
      };
    }

    return { tripwireTriggered: false };
  },
};
```

## Error Handling

When a guardrail is triggered, an error is thrown:

```typescript
try {
  const result = await agent.generate({
    prompt: 'Some potentially unsafe input',
  });
} catch (error) {
  if (error.message.includes('guardrail')) {
    console.log('Guardrail triggered:', error.message);
  }
}
```

## API Reference

### Content Filtering
- `contentFilterInput(options)` - Input content filter
- `contentFilterOutput(options)` - Output content filter

### PII Detection
- `piiDetectorInput(options)` - Input PII detector
- `piiDetectorOutput(options)` - Output PII detector

### Rate Limiting
- `rateLimiter(options)` - Rate limiting guardrail
- `RateLimiter` class - Standalone rate limiter

### Length Validation
- `lengthValidatorInput(options)` - Input length validator
- `lengthValidatorOutput(options)` - Output length validator

## Best Practices

1. **Layer guardrails** - Use multiple complementary checks
2. **Test thoroughly** - Verify guardrails catch issues
3. **Monitor triggers** - Log when guardrails are triggered
4. **Be specific** - Configure guardrails for your use case
5. **Balance safety** - Don't over-restrict legitimate usage

## License

MIT

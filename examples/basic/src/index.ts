import 'dotenv/config';
import { Agent, tool } from '@ai-toolkit/core';
import { cached } from '@ai-toolkit/cache';
import { InMemoryProvider } from '@ai-toolkit/memory';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

/**
 * Basic Example - Demonstrates core features of AI Toolkit
 */

// 1. Create tools
const weatherTool = tool({
  name: 'get_weather',
  description: 'Get weather information for a location',
  parameters: z.object({
    location: z.string().describe('City name'),
  }),
  execute: async ({ location }) => {
    console.log(`[Tool] Fetching weather for ${location}...`);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return `The weather in ${location} is sunny and 72°F`;
  },
});

// 2. Add caching to expensive tools
const cachedWeatherTool = cached(weatherTool, {
  ttl: 5 * 60 * 1000, // 5 minutes
  debug: true,
  onHit: (key) => console.log(`✓ Cache hit for: ${key}`),
  onMiss: (key) => console.log(`✗ Cache miss for: ${key}`),
});

// 3. Create agent with memory
const memoryProvider = new InMemoryProvider();

const agent = new Agent({
  name: 'Assistant',
  model: openai('gpt-4o-mini'),
  instructions: async (context) => {
    // Load working memory
    const memory = await memoryProvider.getWorkingMemory({
      chatId: context.chatId as string,
      scope: 'chat',
    });

    let instructions = 'You are a helpful weather assistant.';

    if (memory) {
      instructions += `\n\n<memory>\n${memory.content}\n</memory>`;
    }

    return instructions;
  },
  tools: {
    get_weather: cachedWeatherTool,
  },
  onEvent: async (event) => {
    switch (event.type) {
      case 'agent-start':
        console.log(`\n🤖 Agent "${event.agent}" started (round ${event.round})`);
        break;
      case 'agent-end':
        console.log(`✅ Agent "${event.agent}" completed\n`);
        break;
      case 'tool-start':
        console.log(`🔧 Calling tool: ${event.toolName}`);
        break;
      case 'agent-error':
        console.error(`❌ Error: ${event.error.message}`);
        break;
    }
  },
});

async function main() {
  console.log('=== AI Toolkit Basic Example ===\n');

  const chatId = 'chat-123';

  // First query
  console.log('Query 1: What is the weather in Tokyo?');
  const result1 = await agent.generate({
    prompt: 'What is the weather in Tokyo?',
    context: { chatId },
  });
  console.log(`Response: ${result1.text}\n`);

  // Same query (should hit cache)
  console.log('Query 2: What is the weather in Tokyo? (should use cache)');
  const result2 = await agent.generate({
    prompt: 'What is the weather in Tokyo?',
    context: { chatId },
  });
  console.log(`Response: ${result2.text}\n`);

  // Store memory
  console.log('Saving preference to working memory...');
  await memoryProvider.updateWorkingMemory({
    chatId,
    scope: 'chat',
    content: `
# User Preferences
- User prefers Celsius over Fahrenheit
- Interested in Japanese weather
    `.trim(),
  });

  // Query with memory context
  console.log('\nQuery 3: What is the weather in Osaka?');
  const result3 = await agent.generate({
    prompt: 'What is the weather in Osaka?',
    context: { chatId },
  });
  console.log(`Response: ${result3.text}\n`);

  // Show cache stats
  console.log('\n=== Cache Statistics ===');
  const stats = cachedWeatherTool.getStats();
  console.log(`Hits: ${stats.hits}`);
  console.log(`Misses: ${stats.misses}`);
  console.log(`Hit Rate: ${(stats.hitRate * 100).toFixed(1)}%`);
  console.log(`Cache Size: ${stats.size}/${stats.maxSize}`);

  // Show memory stats
  console.log('\n=== Memory Statistics ===');
  const memStats = memoryProvider.getStats();
  console.log(`Working Memory Entries: ${memStats.workingMemoryCount}`);
  console.log(`Total Messages: ${memStats.messageCount}`);
  console.log(`Chats: ${memStats.chatCount}`);
}

main().catch(console.error);

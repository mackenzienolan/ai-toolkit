import 'dotenv/config';
import { Agent, tool } from '@ai-toolkit/core';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

/**
 * Multi-Agent Example - Demonstrates handoffs and orchestration
 */

// Weather specialist tools
const weatherTool = tool({
  name: 'get_weather',
  description: 'Get current weather',
  parameters: z.object({
    location: z.string(),
  }),
  execute: async ({ location }) => {
    return `Weather in ${location}: Sunny, 72°F`;
  },
});

const forecastTool = tool({
  name: 'get_forecast',
  description: 'Get 5-day weather forecast',
  parameters: z.object({
    location: z.string(),
  }),
  execute: async ({ location }) => {
    return `5-day forecast for ${location}: Mostly sunny, temps 68-75°F`;
  },
});

// News specialist tool
const newsTool = tool({
  name: 'get_news',
  description: 'Get latest news',
  parameters: z.object({
    topic: z.string(),
  }),
  execute: async ({ topic }) => {
    return `Latest news about ${topic}: [Simulated news article]`;
  },
});

// Calculator specialist tool
const calculatorTool = tool({
  name: 'calculate',
  description: 'Perform mathematical calculations',
  parameters: z.object({
    expression: z.string(),
  }),
  execute: async ({ expression }) => {
    try {
      // In production, use a safe math evaluator
      const result = eval(expression);
      return `Result: ${result}`;
    } catch (e) {
      return `Error: Invalid expression`;
    }
  },
});

// Create specialist agents
const weatherAgent = new Agent({
  name: 'Weather Specialist',
  model: openai('gpt-4o-mini'),
  instructions: `You are a weather specialist. Provide detailed weather information.
  Use get_weather for current conditions and get_forecast for future predictions.`,
  tools: {
    get_weather: weatherTool,
    get_forecast: forecastTool,
  },
  matchOn: ['weather', 'forecast', 'temperature', /climate/i],
  onEvent: async (event) => {
    if (event.type === 'agent-start') {
      console.log(`  ☀️  Weather Specialist activated`);
    }
  },
});

const newsAgent = new Agent({
  name: 'News Specialist',
  model: openai('gpt-4o-mini'),
  instructions: `You are a news specialist. Provide current news and information.`,
  tools: {
    get_news: newsTool,
  },
  matchOn: ['news', 'article', 'headline'],
  onEvent: async (event) => {
    if (event.type === 'agent-start') {
      console.log(`  📰 News Specialist activated`);
    }
  },
});

const mathAgent = new Agent({
  name: 'Math Specialist',
  model: openai('gpt-4o-mini'),
  instructions: `You are a math specialist. Solve mathematical problems and calculations.`,
  tools: {
    calculate: calculatorTool,
  },
  matchOn: ['calculate', 'math', /\d+\s*[\+\-\*\/]\s*\d+/],
  onEvent: async (event) => {
    if (event.type === 'agent-start') {
      console.log(`  🔢 Math Specialist activated`);
    }
  },
});

// Create orchestrator agent
const orchestrator = new Agent({
  name: 'Orchestrator',
  model: openai('gpt-4o-mini'),
  instructions: `You are an intelligent orchestrator that routes queries to specialist agents.

You have access to:
- Weather Specialist: For weather and climate queries
- News Specialist: For news and current events
- Math Specialist: For mathematical calculations

Analyze the user's query and hand off to the appropriate specialist.`,
  handoffs: [weatherAgent, newsAgent, mathAgent],
  onEvent: async (event) => {
    switch (event.type) {
      case 'agent-start':
        console.log(`\n🎯 ${event.agent} - Round ${event.round}`);
        break;
      case 'agent-handoff':
        console.log(`\n🔀 Handoff: ${event.from} → ${event.to}`);
        if (event.reason) {
          console.log(`   Reason: ${event.reason}`);
        }
        break;
    }
  },
});

async function main() {
  console.log('=== AI Toolkit Multi-Agent Example ===\n');

  const queries = [
    'What is the weather in San Francisco?',
    'Calculate 15 * 24 + 100',
    'What are the latest tech news?',
    'Give me a 5-day forecast for New York',
  ];

  for (const query of queries) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Query: "${query}"`);
    console.log('='.repeat(60));

    const result = await orchestrator.generate({
      prompt: query,
    });

    console.log(`\n✨ Final Response:\n${result.text}`);
    console.log(`\n⏱️  Duration: ${result.metadata.duration}ms`);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('All queries completed!');
}

main().catch(console.error);

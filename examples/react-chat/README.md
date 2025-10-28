# React Chat Example

React chat interface demonstrating AI Toolkit features.

## Features

- 💬 Chat interface with `useChat` hook
- 🔧 Cached weather tool
- 🧠 Conversation memory
- 🎨 Pre-built UI components
- 📊 Event monitoring

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Create `.env.local` with your OpenAI API key:
```
VITE_OPENAI_API_KEY=your_api_key_here
```

3. Start dev server:
```bash
pnpm dev
```

4. Open http://localhost:3000

## Try It Out

Ask about weather in different cities:
- "What's the weather in Tokyo?"
- "How about London?"
- "Tokyo again" (should use cached result!)

## Architecture

- **Agent** - Configured with weather tool and memory
- **Cache** - Weather results cached for 5 minutes
- **Memory** - Conversation context persisted
- **React** - `useChat` hook manages state

Check the browser console to see events!

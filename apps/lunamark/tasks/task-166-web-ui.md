---
id: task-166
title: Implement Web UI for chat and review
status: pending
priority: high
labels:
  - cli
  - feature
  - web
created: '2025-01-10'
order: 166
assignee: ai-agent
depends_on:
  - task-165
---

## Description

Create a Web UI that can be launched from the CLI menu, providing a full chat interface, conversation history browser, and code review capabilities.

## Requirements

1. Launch from CLI menu or `--web` flag
2. Full chat interface
3. Conversation history browser
4. File tree with git status
5. Code diff viewer
6. Settings panel
7. Theme support (matches CLI theme)
8. Watch git changes in real-time

## Architecture

The Web UI will be a separate package that:
- Connects to the API server (task-165)
- Receives real-time updates via WebSocket
- Can be served statically or through the CLI's API server

## Implementation

### Step 1: Create Web UI package structure

```
packages/web-ui/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── api/
│   │   ├── client.ts      # API client
│   │   └── websocket.ts   # WebSocket client
│   ├── components/
│   │   ├── Chat/
│   │   │   ├── ChatView.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   └── MessageBubble.tsx
│   │   ├── Sidebar/
│   │   │   ├── SessionList.tsx
│   │   │   └── FileTree.tsx
│   │   ├── Review/
│   │   │   ├── DiffView.tsx
│   │   │   └── IssueList.tsx
│   │   └── Layout/
│   │       ├── Header.tsx
│   │       └── StatusBar.tsx
│   ├── hooks/
│   │   ├── useSession.ts
│   │   ├── useWebSocket.ts
│   │   └── useTheme.ts
│   └── styles/
│       └── globals.css
```

### Step 2: Create package.json

**File:** `packages/web-ui/package.json`

```json
{
  "name": "@stargazer/web-ui",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.4.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

### Step 3: Create API client

**File:** `packages/web-ui/src/api/client.ts`

```typescript
const API_BASE = 'http://localhost:31337/api';

export interface Session {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  projectPath: string;
  model: string;
  totalTokens: number;
  messageCount: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  tokenCount?: number;
}

export async function getStatus() {
  const res = await fetch(`${API_BASE}/status`);
  return res.json();
}

export async function getSessions(): Promise<Session[]> {
  const res = await fetch(`${API_BASE}/sessions`);
  const data = await res.json();
  return data.sessions;
}

export async function getSession(id: string): Promise<{ session: Session; messages: Message[] }> {
  const res = await fetch(`${API_BASE}/sessions/${id}`);
  return res.json();
}

export async function createSession(projectPath: string, model: string): Promise<string> {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectPath, model }),
  });
  const data = await res.json();
  return data.sessionId;
}

export async function sendMessage(sessionId: string, content: string): Promise<void> {
  await fetch(`${API_BASE}/sessions/${sessionId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
}
```

### Step 4: Create WebSocket client

**File:** `packages/web-ui/src/api/websocket.ts`

```typescript
type MessageHandler = (data: any) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private handlers: Map<string, MessageHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(url: string = 'ws://localhost:31337/api/stream') {
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const handlers = this.handlers.get(data.type) || [];
      handlers.forEach(handler => handler(data));

      // Also call 'all' handlers
      const allHandlers = this.handlers.get('all') || [];
      allHandlers.forEach(handler => handler(data));
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(url), 1000 * this.reconnectAttempts);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  on(type: string, handler: MessageHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler);
  }

  off(type: string, handler: MessageHandler) {
    const handlers = this.handlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsClient = new WebSocketClient();
```

### Step 5: Create main App component

**File:** `packages/web-ui/src/App.tsx`

```tsx
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { getSessions, getSession, sendMessage, type Session, type Message } from './api/client';
import { wsClient } from './api/websocket';

const queryClient = new QueryClient();

function ChatView({ sessionId }: { sessionId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streamingContent, setStreamingContent] = useState('');

  // Fetch session messages
  const { data } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => getSession(sessionId),
  });

  useEffect(() => {
    if (data?.messages) {
      setMessages(data.messages);
    }
  }, [data]);

  // Listen for WebSocket updates
  useEffect(() => {
    const handleMessage = (data: any) => {
      if (data.sessionId !== sessionId) return;

      if (data.type === 'message_added') {
        setMessages(prev => [...prev, data.data]);
      }
      if (data.type === 'stream_chunk') {
        setStreamingContent(prev => prev + data.data.chunk);
      }
      if (data.type === 'stream_end') {
        setStreamingContent('');
      }
    };

    wsClient.on('all', handleMessage);
    return () => wsClient.off('all', handleMessage);
  }, [sessionId]);

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(sessionId, input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded-lg ${
              msg.role === 'user'
                ? 'bg-blue-100 ml-auto max-w-[80%]'
                : 'bg-gray-100 mr-auto max-w-[80%]'
            }`}
          >
            <div className="text-xs text-gray-500 mb-1">{msg.role}</div>
            <div className="whitespace-pre-wrap">{msg.content}</div>
          </div>
        ))}
        {streamingContent && (
          <div className="p-3 rounded-lg bg-gray-100 mr-auto max-w-[80%]">
            <div className="text-xs text-gray-500 mb-1">assistant</div>
            <div className="whitespace-pre-wrap">{streamingContent}</div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 border rounded-lg px-4 py-2"
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function SessionList({
  sessions,
  selectedId,
  onSelect,
}: {
  sessions: Session[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="border-r h-full overflow-auto">
      <div className="p-4 font-bold border-b">Sessions</div>
      {sessions.map((session) => (
        <div
          key={session.id}
          onClick={() => onSelect(session.id)}
          className={`p-3 cursor-pointer hover:bg-gray-100 ${
            selectedId === session.id ? 'bg-blue-50' : ''
          }`}
        >
          <div className="font-medium truncate">{session.title}</div>
          <div className="text-xs text-gray-500">
            {new Date(session.updatedAt).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}

function App() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Fetch sessions
  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: getSessions,
  });

  // Connect WebSocket
  useEffect(() => {
    wsClient.connect();
    return () => wsClient.disconnect();
  }, []);

  return (
    <div className="h-screen flex">
      <div className="w-64">
        <SessionList
          sessions={sessions}
          selectedId={selectedSessionId}
          onSelect={setSelectedSessionId}
        />
      </div>
      <div className="flex-1">
        {selectedSessionId ? (
          <ChatView sessionId={selectedSessionId} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a session to view
          </div>
        )}
      </div>
    </div>
  );
}

export default function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}
```

### Step 6: Serve Web UI from CLI

**File:** `packages/cli/src/server/routes.ts`

Add static file serving:

```typescript
import { join } from 'node:path';

// Serve Web UI static files
server.register(import('@fastify/static'), {
  root: join(__dirname, '../../web-ui/dist'),
  prefix: '/',
});

// SPA fallback
server.setNotFoundHandler((request, reply) => {
  if (!request.url.startsWith('/api')) {
    reply.sendFile('index.html');
  } else {
    reply.status(404).send({ error: 'Not found' });
  }
});
```

## Acceptance Criteria

- [ ] Web UI can be launched from CLI menu
- [ ] Shows list of conversation sessions
- [ ] Can view and continue conversations
- [ ] Real-time updates via WebSocket
- [ ] Streaming responses display correctly
- [ ] Responsive layout
- [ ] Matches CLI theme colors

## Test

```bash
# Build web UI
cd /Users/voitz/Projects/gemini-hackathon/packages/web-ui
pnpm install
pnpm build

# Test
# 1. Start CLI
# 2. Select "Open Web UI" from menu
# 3. Browser should open to localhost:31337
# 4. Sessions should display
# 5. Send a message and verify it appears
# 6. Verify streaming works
```

## Files Changed

- CREATE: `packages/web-ui/` (entire package)
- UPDATE: `packages/cli/src/server/routes.ts`
- UPDATE: `packages/cli/package.json` (add @fastify/static)

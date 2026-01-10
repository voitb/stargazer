---
id: task-165
title: Implement local API server for Web UI sync
status: pending
priority: high
labels:
  - cli
  - feature
  - api
created: '2025-01-10'
order: 165
assignee: ai-agent
depends_on:
  - task-154
  - task-157
---

## Description

Create a local HTTP/WebSocket server that runs alongside the CLI, enabling sync between the CLI and a Web UI (like OpenCode).

## Requirements

1. HTTP/WebSocket server running alongside CLI
2. Stream LLM responses to both CLI and Web UI
3. Sync conversation state
4. RESTful API for session management
5. WebSocket for real-time updates

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/status` | Server status |
| GET | `/api/sessions` | List all sessions |
| GET | `/api/sessions/:id` | Get session with messages |
| POST | `/api/sessions` | Create new session |
| DELETE | `/api/sessions/:id` | Delete session |
| POST | `/api/chat` | Send message (returns stream) |
| WS | `/api/stream` | WebSocket for real-time updates |

## Implementation

### Step 1: Install dependencies

**File:** `packages/cli/package.json`

```json
{
  "dependencies": {
    "fastify": "^4.26.0",
    "@fastify/websocket": "^10.0.0",
    "@fastify/cors": "^9.0.0"
  }
}
```

Run: `pnpm install`

### Step 2: Create API server

**File:** `packages/cli/src/server/index.ts` (create)

```typescript
import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { registerRoutes } from './routes.js';
import { WebSocketManager } from './websocket.js';

export interface ServerOptions {
  port: number;
  host: string;
}

const DEFAULT_OPTIONS: ServerOptions = {
  port: 31337,
  host: '127.0.0.1',
};

let serverInstance: FastifyInstance | null = null;
let wsManager: WebSocketManager | null = null;

export async function startServer(
  options: Partial<ServerOptions> = {}
): Promise<{ url: string; wsManager: WebSocketManager }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const server = Fastify({
    logger: false,
  });

  // Register plugins
  await server.register(cors, {
    origin: true, // Allow all origins for local development
  });
  await server.register(websocket);

  // Create WebSocket manager
  wsManager = new WebSocketManager();

  // Register routes
  registerRoutes(server, wsManager);

  // Start server
  await server.listen({ port: opts.port, host: opts.host });

  serverInstance = server;
  const url = `http://${opts.host}:${opts.port}`;

  return { url, wsManager };
}

export async function stopServer(): Promise<void> {
  if (serverInstance) {
    await serverInstance.close();
    serverInstance = null;
  }
  if (wsManager) {
    wsManager.closeAll();
    wsManager = null;
  }
}

export function getWebSocketManager(): WebSocketManager | null {
  return wsManager;
}
```

### Step 3: Create WebSocket manager

**File:** `packages/cli/src/server/websocket.ts` (create)

```typescript
import { type WebSocket } from '@fastify/websocket';

export type MessageType =
  | 'session_created'
  | 'session_updated'
  | 'message_added'
  | 'stream_start'
  | 'stream_chunk'
  | 'stream_end'
  | 'error';

export interface WSMessage {
  type: MessageType;
  sessionId?: string;
  data: unknown;
  timestamp: string;
}

export class WebSocketManager {
  private clients: Set<WebSocket> = new Set();

  addClient(ws: WebSocket): void {
    this.clients.add(ws);
    ws.on('close', () => {
      this.clients.delete(ws);
    });
  }

  broadcast(message: WSMessage): void {
    const data = JSON.stringify(message);
    for (const client of this.clients) {
      if (client.readyState === 1) { // OPEN
        client.send(data);
      }
    }
  }

  broadcastToSession(sessionId: string, message: WSMessage): void {
    this.broadcast({ ...message, sessionId });
  }

  sendStreamChunk(sessionId: string, chunk: string): void {
    this.broadcast({
      type: 'stream_chunk',
      sessionId,
      data: { chunk },
      timestamp: new Date().toISOString(),
    });
  }

  sendStreamEnd(sessionId: string): void {
    this.broadcast({
      type: 'stream_end',
      sessionId,
      data: {},
      timestamp: new Date().toISOString(),
    });
  }

  closeAll(): void {
    for (const client of this.clients) {
      client.close();
    }
    this.clients.clear();
  }
}
```

### Step 4: Create API routes

**File:** `packages/cli/src/server/routes.ts` (create)

```typescript
import { type FastifyInstance } from 'fastify';
import { type WebSocketManager } from './websocket.js';
import {
  getAllSessions,
  getSessionMessages,
  createSession,
  deleteSession,
  addMessage,
} from '../tui/storage/session-store.js';

export function registerRoutes(
  server: FastifyInstance,
  wsManager: WebSocketManager
): void {
  // Health check
  server.get('/api/status', async () => ({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  }));

  // List sessions
  server.get('/api/sessions', async () => {
    const sessions = await getAllSessions();
    return { sessions };
  });

  // Get session with messages
  server.get<{ Params: { id: string } }>('/api/sessions/:id', async (request, reply) => {
    const { id } = request.params;
    const sessions = await getAllSessions();
    const session = sessions.find(s => s.id === id);

    if (!session) {
      reply.status(404);
      return { error: 'Session not found' };
    }

    const messages = await getSessionMessages(id);
    return { session, messages };
  });

  // Create session
  server.post<{ Body: { projectPath: string; model: string } }>(
    '/api/sessions',
    async (request) => {
      const { projectPath, model } = request.body;
      const sessionId = await createSession(projectPath, model);

      wsManager.broadcast({
        type: 'session_created',
        sessionId,
        data: { projectPath, model },
        timestamp: new Date().toISOString(),
      });

      return { sessionId };
    }
  );

  // Delete session
  server.delete<{ Params: { id: string } }>('/api/sessions/:id', async (request) => {
    const { id } = request.params;
    await deleteSession(id);
    return { success: true };
  });

  // Send chat message (streaming)
  server.post<{
    Params: { id: string };
    Body: { content: string };
  }>('/api/sessions/:id/chat', async (request, reply) => {
    const { id } = request.params;
    const { content } = request.body;

    // Add user message
    const userMessage = await addMessage(id, {
      role: 'user',
      content,
    });

    wsManager.broadcast({
      type: 'message_added',
      sessionId: id,
      data: userMessage,
      timestamp: new Date().toISOString(),
    });

    // Start streaming response
    wsManager.broadcast({
      type: 'stream_start',
      sessionId: id,
      data: {},
      timestamp: new Date().toISOString(),
    });

    // TODO: Call LLM and stream response
    // For now, return placeholder
    return {
      userMessage,
      status: 'streaming',
    };
  });

  // WebSocket connection
  server.get('/api/stream', { websocket: true }, (connection) => {
    wsManager.addClient(connection.socket);

    connection.socket.on('message', (message) => {
      // Handle incoming WebSocket messages if needed
      const data = JSON.parse(message.toString());
      console.log('WS message:', data);
    });
  });
}
```

### Step 5: Integrate with CLI

**File:** `packages/cli/src/tui/app.tsx`

Start server when CLI starts:

```typescript
import { startServer, stopServer, getWebSocketManager } from '../server/index.js';

function AppContent({ projectPath }: AppContentProps) {
  const [serverUrl, setServerUrl] = useState<string | null>(null);

  // Start API server
  useEffect(() => {
    startServer()
      .then(({ url }) => {
        setServerUrl(url);
        console.log(`API server running at ${url}`);
      })
      .catch(console.error);

    return () => {
      stopServer();
    };
  }, []);

  // When streaming LLM response, broadcast to WebSocket
  const handleLLMResponse = useCallback((chunk: string, sessionId: string) => {
    const wsManager = getWebSocketManager();
    wsManager?.sendStreamChunk(sessionId, chunk);
  }, []);

  // ... rest of component
}
```

### Step 6: Add server control to menu

**File:** `packages/cli/src/tui/components/navigation/main-menu.tsx`

Add menu option:

```typescript
{ value: 'web-ui', label: 'Open Web UI' },
```

**File:** `packages/cli/src/tui/app.tsx`

Handle menu selection:

```typescript
case 'web-ui':
  if (serverUrl) {
    // Open browser
    const open = await import('open');
    await open.default(serverUrl);
  }
  break;
```

## Acceptance Criteria

- [ ] Server starts automatically with CLI
- [ ] `/api/status` returns health check
- [ ] `/api/sessions` lists all sessions
- [ ] `/api/sessions/:id` returns session with messages
- [ ] POST `/api/sessions/:id/chat` accepts messages
- [ ] WebSocket broadcasts real-time updates
- [ ] LLM responses stream to WebSocket
- [ ] Server stops when CLI exits

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm install
pnpm exec tsc --noEmit

# Manual test:
# 1. Start CLI
# 2. Verify server starts (check console)
# 3. curl http://localhost:31337/api/status
# 4. curl http://localhost:31337/api/sessions
# 5. Test WebSocket with wscat: wscat -c ws://localhost:31337/api/stream
# 6. Send a chat message and verify WebSocket receives it
```

## Files Changed

- CREATE: `packages/cli/src/server/index.ts`
- CREATE: `packages/cli/src/server/websocket.ts`
- CREATE: `packages/cli/src/server/routes.ts`
- UPDATE: `packages/cli/package.json`
- UPDATE: `packages/cli/src/tui/app.tsx`
- UPDATE: `packages/cli/src/tui/components/navigation/main-menu.tsx`

# Lunamark Architecture

This document describes the technical architecture of Lunamark, a markdown-based Kanban task management tool.

## Overview

Lunamark is built with **TanStack Start**, a full-stack React framework. It reads task data from markdown files with YAML frontmatter and displays them on a drag-and-drop Kanban board.

```
┌─────────────────────────────────────────────────────────────┐
│                     React UI (Browser)                       │
│  KanbanBoard → Column → TaskCard (drag-drop with @dnd-kit)  │
│                                                              │
│  useBoard() hook ←──── Server Functions (type-safe RPC)     │
└─────────────────────────┬───────────────────────────────────┘
                          │ createServerFn() calls
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                TanStack Start Server (Node.js)               │
│                                                              │
│  Server Functions:                                          │
│    getBoard()     → loadBoard() → parse all .md files       │
│    createTask()   → serialize → write .md file              │
│    updateTask()   → serialize → write .md file              │
│    moveTask()     → update frontmatter → write .md file     │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    File System                               │
│  tasks/                                                      │
│  ├── task-001-implement-auth.md                             │
│  ├── task-002-fix-login-bug.md                              │
│  └── task-003-add-tests.md                                  │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | TanStack Start | Full-stack React, server functions, file-based routing |
| **Routing** | TanStack Router | Type-safe routing with loaders |
| **Styling** | Tailwind CSS v4 | Utility-first, fast development |
| **Drag & Drop** | @dnd-kit/react | Modern, maintained, accessible |
| **Real-time** | Server-Sent Events (SSE) | One-way server→client notifications |
| **File Watch** | chokidar | Industry standard for Node.js |
| **MD Parsing** | gray-matter | Simple frontmatter parse/stringify |
| **Validation** | Zod | Schema validation with TypeScript inference |
| **IDs** | nanoid | Compact, URL-safe unique IDs |

## Directory Structure

```
apps/lunamark/
├── docs/                     # Documentation
│   ├── README.md             # Overview
│   ├── architecture.md       # This file
│   ├── task-format.md        # Task file specification
│   └── implementation-plan.md # Development phases
│
├── tasks/                    # Task markdown files (source of truth)
│   └── *.md
│
├── src/
│   ├── lib/                  # Shared utilities
│   │   ├── schemas/
│   │   │   └── task.ts       # Zod schemas
│   │   ├── task-parser.ts    # gray-matter parsing
│   │   └── board-loader.ts   # Read all .md files
│   │
│   ├── serverFunctions/      # TanStack Start server functions
│   │   └── board.ts          # getBoard(), createTask(), etc.
│   │
│   ├── components/           # React components
│   │   ├── KanbanBoard.tsx   # Main board with DragDropProvider
│   │   ├── Column.tsx        # Droppable column
│   │   └── TaskCard.tsx      # Draggable card
│   │
│   ├── hooks/                # Custom hooks
│   │   └── useBoard.ts       # Data fetching wrapper
│   │
│   ├── routes/               # TanStack Router pages
│   │   ├── __root.tsx        # Root layout
│   │   └── index.tsx         # Kanban board page
│   │
│   ├── router.tsx            # Router configuration
│   └── routeTree.gen.ts      # Auto-generated route tree
│
└── public/                   # Static assets
```

## Key Design Decisions

### 1. TanStack Start over Next.js/Remix

**Why TanStack Start?**
- Server functions replace REST API boilerplate
- Type-safe RPC with `createServerFn()`
- Direct file system access in server functions
- No separate backend needed

```typescript
// TanStack Start: Clean server function
export const getBoard = createServerFn({ method: 'GET' }).handler(async () => {
  return await loadBoard(TASKS_DIR)
})

// vs REST API: More boilerplate
app.get('/api/board', async (req, res) => {
  const board = await loadBoard(TASKS_DIR)
  res.json(board)
})
```

### 2. @dnd-kit over react-beautiful-dnd

**Why @dnd-kit?**
- `react-beautiful-dnd` is deprecated (2022)
- @dnd-kit is actively maintained
- Better accessibility support
- More flexible API

```tsx
// @dnd-kit: Modern API with DragDropProvider
<DragDropProvider onDragOver={handleDragOver}>
  {columns.map(col => (
    <Column key={col.id}>
      {col.tasks.map(task => <TaskCard key={task.id} task={task} />)}
    </Column>
  ))}
</DragDropProvider>
```

### 3. gray-matter for Markdown Parsing

**Why gray-matter?**
- Simple API: `matter(content)` returns `{ data, content }`
- Preserves markdown formatting during round-trip
- Handles YAML frontmatter natively

```typescript
import matter from 'gray-matter'

const { data, content } = matter(fileContent)
// data = frontmatter object
// content = markdown body
```

### 4. File-based Task Storage

**Why markdown files?**
- Human-readable and editable
- Version control friendly (git)
- No database required
- Works offline

**Trade-offs:**
- Limited concurrent editing (last-write-wins)
- No complex queries (read all files)
- File system as bottleneck for large task counts

### 5. Vertical Module Organization

Following [TanStack Router best practices](https://swizec.com/blog/tips-from-8-months-of-tan-stack-router-in-production/):

- `lib/` for horizontal concerns (schemas, utilities)
- `serverFunctions/` clearly separated from client code
- Avoid deep `../../../` imports
- Keep related code close together

## Data Flow

### Read Flow (getBoard)
```
User opens app
    ↓
Route loader calls getBoard()
    ↓
Server function reads tasks/ directory
    ↓
Each .md file parsed with gray-matter
    ↓
Zod validates frontmatter
    ↓
Tasks grouped by status column
    ↓
Board data returned to client
    ↓
React renders KanbanBoard
```

### Write Flow (moveTask)
```
User drags card to new column
    ↓
onDragEnd calls moveTask()
    ↓
Server function reads task file
    ↓
Updates status in frontmatter
    ↓
Writes file back with gray-matter.stringify()
    ↓
Returns updated task
    ↓
UI updates optimistically
```

### Real-time Sync (Future)
```
External edit (VS Code)
    ↓
chokidar detects file change
    ↓
Server sends SSE event
    ↓
Client receives notification
    ↓
useBoard() refetches data
    ↓
UI re-renders with new data
```

## Type System

### Core Types

```typescript
// Task status (Kanban columns)
type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done'

// Task priority
type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

// Task metadata (YAML frontmatter)
interface TaskMetadata {
  id: string
  title: string
  status: TaskStatus
  priority: TaskPriority
  labels: string[]
  assignee?: string
  created: string
  due?: string
  order: number
}

// Full task (metadata + content)
interface Task {
  id: string
  filePath: string
  metadata: TaskMetadata
  content: string  // Markdown body
}

// Board structure
interface Board {
  columns: Column[]
  tasksDir: string
}

interface Column {
  id: TaskStatus
  title: string
  tasks: Task[]
}
```

## Error Handling

### Validation Errors
- Invalid frontmatter logged to console
- Task still displayed with warning badge
- User can fix in editor

### File System Errors
- File not found: Task removed from board
- Permission denied: Error toast shown
- Concurrent edit: Last write wins

### Network Errors
- Server function failure: Error boundary catches
- Retry logic in useQuery

## Performance Considerations

### Current (MVP)
- Read all files on every board load
- No caching between requests
- Suitable for ~100-500 tasks

### Future Optimizations
- File-level caching with timestamps
- Incremental updates via SSE
- Index file for faster reads
- Pagination for large boards

## Security

### File System Access
- Server functions run on Node.js
- Tasks directory path validated
- No arbitrary file access
- Sandboxed to configured directory

### Input Validation
- Zod schemas validate all input
- Sanitize markdown content
- Prevent path traversal attacks

## Testing Strategy

### Unit Tests
- Schema validation
- Task parser
- Board loader

### Integration Tests
- Server functions
- File read/write operations

### E2E Tests
- Drag and drop interactions
- Task CRUD operations
- Real-time sync

## Future Considerations

1. **Multi-user Support**: WebSocket for real-time collaboration
2. **Plugins**: Custom columns, integrations
3. **Search**: Full-text search across tasks
4. **Export**: CSV, JSON, Jira sync
5. **VS Code Extension**: Inline task management

# Lunamark Implementation Plan

This document outlines the phased implementation approach for Lunamark.

## Phase Overview

| Phase | Focus | Deliverable |
|-------|-------|-------------|
| **Phase 0** | Monorepo & Docs | ✅ Complete - Working monorepo + documentation |
| **Phase 1** | Foundation (MVP) | Read-only Kanban board from .md files |
| **Phase 2** | Write Operations | Full CRUD + drag-and-drop |
| **Phase 3** | Real-time Sync | Bi-directional file ↔ UI sync |
| **Phase 4** | Polish & CLI | Production-ready tool |

---

## Phase 0: Monorepo & Documentation ✅ Complete

- [x] Create root `package.json` with monorepo scripts
- [x] Create `pnpm-workspace.yaml` defining apps/* and packages/*
- [x] Create `turbo.json` with build/dev/lint pipelines
- [x] Create `tsconfig.base.json` with shared TypeScript settings
- [x] Create placeholder `packages/` directories (core, cli, action)
- [x] Create `apps/lunamark/docs/` structure
- [x] Write `apps/lunamark/docs/README.md` - Lunamark overview
- [x] Write `apps/lunamark/docs/task-format.md` - Task spec
- [x] Write `apps/lunamark/docs/architecture.md` - Technical architecture
- [x] Write `apps/lunamark/docs/implementation-plan.md` - This file

**Deliverable**: Working monorepo structure + initial documentation

---

## Phase 1: Foundation (MVP) 🔄 In Progress

### Dependencies to Install
```bash
pnpm --filter lunamark add gray-matter zod @dnd-kit/react @dnd-kit/dom @dnd-kit/helpers chokidar nanoid
```

### Tasks

- [ ] Install dependencies
- [ ] Create `src/lib/schemas/task.ts` - Zod schemas for Task, TaskMetadata
- [ ] Create `src/lib/task-parser.ts` - Parse .md file → Task object
- [ ] Create `src/lib/board-loader.ts` - Read directory → Board object
- [ ] Create `src/serverFunctions/board.ts` - `getBoard()` server function
- [ ] Create `src/hooks/useBoard.ts` - useQuery wrapper for data fetching
- [ ] Create `src/components/TaskCard.tsx` - Individual task card
- [ ] Create `src/components/Column.tsx` - Kanban column container
- [ ] Create `src/components/KanbanBoard.tsx` - Main board with DragDropProvider
- [ ] Update `src/routes/index.tsx` - Wire up board page
- [ ] Create sample tasks in `tasks/` directory

### File Structure After Phase 1
```
src/
├── lib/
│   ├── schemas/
│   │   └── task.ts           # Zod schemas
│   ├── task-parser.ts        # gray-matter parsing
│   └── board-loader.ts       # Read all .md files
├── serverFunctions/
│   └── board.ts              # getBoard()
├── hooks/
│   └── useBoard.ts           # useQuery wrapper
├── components/
│   ├── TaskCard.tsx
│   ├── Column.tsx
│   └── KanbanBoard.tsx
└── routes/
    └── index.tsx             # Updated to show board
```

**Deliverable**: Read-only Kanban board displaying tasks from .md files

---

## Phase 2: Write Operations

### Tasks

- [ ] Create `src/lib/task-serializer.ts` - Task object → .md file
- [ ] Create `src/lib/id-generator.ts` - nanoid-based ID generation
- [ ] Add `createTask()` server function
- [ ] Add `updateTask()` server function
- [ ] Add `deleteTask()` server function
- [ ] Add `moveTask()` server function (drag-and-drop)
- [ ] Create `src/components/TaskEditor.tsx` - Edit task modal
- [ ] Create `src/components/CreateTaskButton.tsx` - New task button
- [ ] Implement drag-and-drop with @dnd-kit
- [ ] Add optimistic updates for instant UI feedback
- [ ] Document server functions in `docs/api/server-functions.md`

### Key Patterns
```typescript
// Optimistic update pattern
const moveTask = useMutation({
  mutationFn: moveTaskFn,
  onMutate: async ({ taskId, newStatus }) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['board'])

    // Snapshot previous value
    const previous = queryClient.getQueryData(['board'])

    // Optimistically update
    queryClient.setQueryData(['board'], (old) => {
      // Move task to new column
    })

    return { previous }
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['board'], context.previous)
  },
})
```

**Deliverable**: Full CRUD + drag-and-drop working

---

## Phase 3: Real-time Sync

### Tasks

- [ ] Create `src/lib/file-watcher.ts` - chokidar wrapper
- [ ] Create SSE endpoint for file change events
- [ ] Create `src/hooks/useFileWatcher.ts` - SSE client
- [ ] Implement automatic board refresh on file changes
- [ ] Add debouncing for rapid file changes
- [ ] Handle file conflicts (last-write-wins with notification)
- [ ] Add loading states for all operations
- [ ] Add toast notifications for actions
- [ ] Update `docs/architecture.md` with sync flow

### Sync Flow
```
┌─────────────────────────────────────────────────────────────┐
│                     Bi-directional Sync                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  UI Change Flow:                                            │
│  User action → Server function → Write file → Done          │
│                                                              │
│  External Edit Flow:                                        │
│  VS Code edit → chokidar → SSE → Client → Refetch → Render │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Deliverable**: Bi-directional sync between UI and files

---

## Phase 4: Polish & CLI

### Tasks

- [ ] Create `cli/index.ts` - CLI entry point
- [ ] Implement `lunamark serve` command
- [ ] Implement `lunamark init` command (scaffolds tasks/)
- [ ] Implement `lunamark list` command (terminal output)
- [ ] Add filtering by priority, labels, assignee
- [ ] Add search functionality
- [ ] Add keyboard shortcuts
- [ ] Create `lunamark.config.ts` schema
- [ ] Implement config file loading
- [ ] Write `docs/development.md` - Contributing guide
- [ ] Add comprehensive error messages
- [ ] Performance optimization pass

### CLI Usage
```bash
# Start the Kanban board server
lunamark serve

# With options
lunamark serve --port 4000 --dir ./my-tasks

# Initialize a new tasks directory
lunamark init

# List tasks in terminal
lunamark list --status in-progress
```

**Deliverable**: Production-ready internal tool

---

## Future Phases (Post-MVP)

### Phase 5: Standalone Package
- [ ] Extract to separate repository
- [ ] Create `create-lunamark` scaffolding CLI
- [ ] Publish to npm
- [ ] Add GitHub template repository

### Phase 6: Integrations
- [ ] VS Code extension
- [ ] Jira sync plugin
- [ ] GitHub Issues import
- [ ] Export to CSV/JSON

### Phase 7: Collaboration
- [ ] WebSocket for multi-user
- [ ] Conflict resolution UI
- [ ] User presence indicators
- [ ] Activity history

---

## Dependencies Summary

### Phase 1
```json
{
  "gray-matter": "^4.x",
  "zod": "^3.x",
  "@dnd-kit/react": "^0.x",
  "@dnd-kit/dom": "^0.x",
  "@dnd-kit/helpers": "^0.x",
  "nanoid": "^5.x"
}
```

### Phase 3 (Additional)
```json
{
  "chokidar": "^3.x"
}
```

### Phase 4 (Additional)
```json
{
  "commander": "^12.x"
}
```

---

## Success Metrics

| Phase | Metric |
|-------|--------|
| Phase 1 | Board loads and displays tasks from files |
| Phase 2 | Can create, edit, delete, and drag tasks |
| Phase 3 | External file edits reflect in UI within 1 second |
| Phase 4 | `lunamark serve` starts server successfully |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Large number of tasks | Implement pagination, file caching |
| Concurrent edits | Last-write-wins with warning toast |
| File system errors | Graceful error handling, retry logic |
| Browser compatibility | Test in Chrome, Firefox, Safari |

---

## Resources

- [TanStack Start Docs](https://tanstack.com/start)
- [TanStack Start Server Functions](https://tanstack.com/router/latest/docs/framework/react/start/server-functions)
- [dnd-kit Documentation](https://dndkit.com/)
- [gray-matter npm](https://www.npmjs.com/package/gray-matter)
- [Zod Documentation](https://zod.dev/)

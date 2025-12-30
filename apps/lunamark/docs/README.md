# Lunamark

**Markdown-based Kanban task management for developers.**

Lunamark treats markdown files as the source of truth for your tasks. Each `.md` file with YAML frontmatter becomes a card on your Kanban board. Edit files in your IDE, drag cards in the UI - everything stays in sync.

## Features

- **Markdown-First**: Tasks are `.md` files with YAML frontmatter
- **Bi-directional Sync**: Changes in UI update files, file changes reflect in UI
- **Local-First**: Runs on your machine, no cloud required
- **Developer-Friendly**: Works alongside your code in version control

## Quick Start

```bash
# From the monorepo root
pnpm lunamark

# Or from the lunamark directory
cd apps/lunamark
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your Kanban board.

## How It Works

1. Create a `tasks/` directory in your project
2. Add `.md` files with frontmatter (see [Task Format](./task-format.md))
3. Run `lunamark serve`
4. Drag cards, edit tasks - changes save to your files

## Project Structure

```
apps/lunamark/
├── docs/                    # Documentation (you are here)
├── src/
│   ├── routes/              # TanStack Router pages
│   ├── components/          # React components
│   ├── hooks/               # Custom React hooks
│   └── server/              # Server-side code
│       ├── functions/       # TanStack Start server functions
│       ├── lib/             # Task parser, serializer, etc.
│       └── schemas/         # Zod validation schemas
└── cli/                     # CLI entry point
```

## Tech Stack

| Technology | Purpose |
|------------|---------|
| TanStack Start | Full-stack React framework |
| TanStack Router | Type-safe file-based routing |
| Tailwind CSS v4 | Styling |
| @dnd-kit | Drag and drop |
| gray-matter | Markdown frontmatter parsing |
| chokidar | File system watching |
| Zod | Schema validation |

## Documentation

- [Task Format Specification](./task-format.md) - How to structure task files
- [Architecture](./architecture.md) - Technical design (coming soon)
- [Development Guide](./development.md) - Contributing to Lunamark (coming soon)
- [Server Functions API](./api/server-functions.md) - Backend API reference (coming soon)

## Future Plans

Lunamark is currently an internal tool in the Stargazer monorepo. Future goals:

1. **Standalone npm package** - `npx lunamark init`
2. **VS Code extension** - Inline task management
3. **Plugin system** - Custom columns, integrations
4. **Export/Import** - CSV, JSON, Jira sync

## Name Origin

**Luna** (moon) + **Mark**(down) = **Lunamark**

Part of the Stargazer ecosystem (astronomy theme), with a nod to the markdown-based architecture.

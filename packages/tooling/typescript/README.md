# @repo/typescript

Shared TypeScript configurations for the Stargazer monorepo.

## Available Configs

| Config | Use Case |
|--------|----------|
| `@repo/typescript/base` | Base config (extended by others) |
| `@repo/typescript/node` | Node.js packages (no DOM) |
| `@repo/typescript/react` | React web applications |
| `@repo/typescript/cli` | CLI/Ink TUI applications |

## Usage

In your package's `tsconfig.json`:

```json
{
  "extends": "@repo/typescript/react",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

## Adding This Package

```bash
pnpm --filter your-package add -D @repo/typescript
```

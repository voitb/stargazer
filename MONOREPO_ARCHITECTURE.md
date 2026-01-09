# Monorepo Architecture

Architectural guidelines for the Stargazer monorepo. Optimized for AI agents and developer onboarding.

> For React/TypeScript patterns, see [ARCHITECTURE_RULES.md](./ARCHITECTURE_RULES.md)
> For CLI/TUI patterns, see [packages/cli/CLI_ARCHITECTURE.md](./packages/cli/CLI_ARCHITECTURE.md)

---

## Table of Contents

1. [Overview](#overview)
2. [Directory Structure](#directory-structure)
3. [Package Types](#package-types)
4. [Dependency Flow](#dependency-flow)
5. [Package Design Principles](#package-design-principles)
6. [Configuration Strategy](#configuration-strategy)
7. [TypeScript Configuration](#typescript-configuration)
8. [Turborepo Task Pipeline](#turborepo-task-pipeline)
9. [Development Workflow](#development-workflow)
10. [Adding New Packages](#adding-new-packages)
11. [Decision Trees](#decision-trees)
12. [Common Patterns](#common-patterns)
13. [Anti-Patterns](#anti-patterns)

---

## Overview

This monorepo uses the **Turborepo + pnpm workspaces** stack, the recommended approach for TypeScript monorepos in 2025/2026.

### Technology Stack

| Tool | Purpose | Why |
|------|---------|-----|
| **pnpm** | Package manager | Disk-efficient (symlinks), strict `node_modules`, built-in workspaces |
| **Turborepo** | Build orchestration | Incremental builds, remote caching, parallel execution, task pipelines |
| **TypeScript** | Type system | Strict mode, ESM-first, shared base config |
| **Biome/ESLint** | Linting & formatting | Per-package configuration with shared rules |

### Core Principles

1. **Package isolation** - Each package is a standalone unit with its own dependencies
2. **Shared configurations** - DRY principle for tooling (TypeScript, linting, formatting)
3. **Workspace protocols** - Use `workspace:*` for internal dependencies
4. **No cross-boundary file access** - Import packages, never traverse `../` across packages
5. **Explicit public APIs** - Packages export only what's needed via `exports` field
6. **Topological builds** - Dependencies build before dependents

---

## Directory Structure

```
stargazer-monorepo/
│
├── apps/                           # Standalone applications (not published)
│   └── lunamark/                   # TanStack Start web app
│       ├── src/                    # Application source (features, routes)
│       ├── cli/                    # Embedded CLI (optional)
│       ├── packages/ui/            # App-specific design system
│       ├── package.json
│       └── tsconfig.json
│
├── packages/                       # Shared/publishable packages
│   ├── core/                       # @stargazer/core - Core business logic
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── cli/                        # @stargazer/cli - Interactive TUI
│   │   ├── src/
│   │   │   ├── commands/           # Non-interactive commands
│   │   │   └── tui/                # Ink-based interactive UI
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── action/                     # @stargazer/action - GitHub Action
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── tooling/                    # @repo/tooling - Shared configurations
│       ├── typescript/             # TypeScript base configs
│       ├── eslint/                 # ESLint shared configs (future)
│       └── package.json
│
├── docs/                           # Documentation
│   ├── en/
│   └── pl/
│
├── types/                          # Global type definitions (legacy, migrate to @repo/types)
│
├── .turbo/                         # Turborepo cache and state
│
├── turbo.json                      # Turborepo task configuration
├── pnpm-workspace.yaml             # Workspace package locations
├── tsconfig.base.json              # Shared TypeScript config (root)
├── package.json                    # Root scripts and dev dependencies
│
├── ARCHITECTURE_RULES.md           # React/TypeScript patterns
├── MONOREPO_ARCHITECTURE.md        # This file - monorepo patterns
└── CLI_ARCHITECTURE.md             # (in packages/cli) TUI patterns
```

### Directory Naming Conventions

| Directory | Purpose | Naming |
|-----------|---------|--------|
| `apps/` | Deployable applications | kebab-case, product names |
| `packages/` | Shared libraries | kebab-case, functional names |
| `docs/` | Documentation | Language codes for i18n |
| `types/` | Global types | Reserved name |

---

## Package Types

### Applications (`apps/`)

Self-contained, deployable applications. **NOT published** to npm.

| Package | Description | Extractable |
|---------|-------------|-------------|
| `lunamark` | Web dashboard + embedded CLI | Yes (future) |

**Characteristics:**
- Has its own routing, build process, deployment pipeline
- Can depend on `packages/*` via `workspace:*`
- Contains app-specific components, pages, features
- May embed sub-packages (like `packages/ui/` inside `lunamark`)
- Build output: deployable artifacts (static files, server bundles)

**When to create an app:**
- It's a deployable product (web app, mobile app, desktop app)
- It has its own entry point and build pipeline
- It's not meant to be imported by other packages

### Shared Packages (`packages/`)

Reusable libraries shared across apps. **May be published** to npm.

| Package | npm Name | Purpose | Publishable |
|---------|----------|---------|-------------|
| `core` | `@stargazer/core` | Core business logic, API clients, utilities | Yes |
| `cli` | `@stargazer/cli` | Interactive TUI with Ink | Yes |
| `action` | `@stargazer/action` | GitHub Action entrypoint | No (bundled) |
| `tooling` | `@repo/tooling` | Shared configs (TS, ESLint) | No (internal) |

**Characteristics:**
- Standalone with own `package.json`, `tsconfig.json`
- Published exports via `exports` field in package.json
- Should work independently of apps
- Build output: ES modules, type definitions

**When to create a package:**
- Logic is shared by 2+ apps or packages
- It has a clear, bounded responsibility
- It could theoretically be open-sourced or published

### Internal Packages (`@repo/*`)

Packages that are never published, used only within the monorepo.

| Package | Purpose |
|---------|---------|
| `@repo/tooling` | Shared TypeScript, ESLint, Biome configs |
| `@repo/types` | Shared type definitions (future) |

**Naming convention:**
- Internal packages use `@repo/*` namespace
- Publishable packages use `@stargazer/*` namespace

---

## Dependency Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                           apps/                                  │
│                    (lunamark, future apps)                       │
│            Standalone applications, NOT importable               │
└───────────────────────────┬─────────────────────────────────────┘
                            │ imports from
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        packages/                                 │
│              @stargazer/core, @stargazer/cli, etc.              │
│                 Shared libraries, importable                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │ imports from
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    @repo/* (internal)                            │
│               @repo/tooling, @repo/types (future)               │
│              Configuration and type packages                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │ imports from
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   External dependencies                          │
│                 (npm packages, node built-ins)                   │
└─────────────────────────────────────────────────────────────────┘
```

### Dependency Rules

| From | Can Import | Cannot Import |
|------|------------|---------------|
| `apps/*` | `packages/*`, `@repo/*`, external | Other `apps/*` |
| `packages/*` | Other `packages/*`, `@repo/*`, external | `apps/*` |
| `@repo/*` | Other `@repo/*`, external | `apps/*`, `packages/*` |

**Key rules:**
- ✅ `apps/` can import from `packages/` and `@repo/*`
- ✅ `packages/` can import from other `packages/` (if declared as dependency)
- ✅ `@repo/*` packages can import from each other
- ❌ `packages/` should NOT import from `apps/`
- ❌ Never use `../` to access files across package boundaries
- ❌ Circular dependencies between packages are forbidden

---

## Package Design Principles

### Single Responsibility

Each package should have ONE clear purpose:

```
# GOOD: Clear boundaries
@stargazer/core     → Business logic, API clients
@stargazer/cli      → Terminal UI, user interaction
@stargazer/action   → GitHub Action integration

# BAD: Mixed responsibilities
@stargazer/utils    → Random utilities (too vague)
@stargazer/common   → Shared everything (dumping ground)
```

### Explicit Public APIs

Use the `exports` field to define what's importable:

```json
{
  "name": "@stargazer/core",
  "exports": {
    ".": "./dist/index.js",
    "./api": "./dist/api/index.js",
    "./types": "./dist/types/index.js"
  }
}
```

**Benefits:**
- Tree-shaking works correctly
- Clear contract with consumers
- Prevents deep imports into internals

### Minimal Dependencies

Packages should depend only on what they need:

```json
// GOOD: Minimal dependencies
{
  "dependencies": {
    "zod": "^4.0.0"
  }
}

// BAD: Kitchen sink
{
  "dependencies": {
    "lodash": "...",
    "moment": "...",
    "axios": "...",
    "everything": "..."
  }
}
```

### Peer Dependencies for Shared Libraries

When multiple packages use the same library (React, TypeScript):

```json
{
  "peerDependencies": {
    "react": "^19.0.0"
  },
  "devDependencies": {
    "react": "^19.0.0"
  }
}
```

---

## Configuration Strategy

### Shared vs Package-Specific

| Configuration | Location | Extends From |
|--------------|----------|--------------|
| TypeScript (base) | `tsconfig.base.json` | - |
| TypeScript (package) | `packages/*/tsconfig.json` | `tsconfig.base.json` |
| TypeScript (app) | `apps/*/tsconfig.json` | `tsconfig.base.json` |
| Turborepo | `turbo.json` | - |
| pnpm workspaces | `pnpm-workspace.yaml` | - |
| Package manager | `package.json` (`packageManager` field) | - |

### Root package.json

The root `package.json` serves as the workspace orchestrator:

```json
{
  "name": "stargazer-monorepo",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@9.15.0",
  "engines": {
    "node": ">=20.0.0"
  },
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint",
    "clean": "turbo clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^2.3.3"
  }
}
```

**Key points:**
- `private: true` - Never publish the root
- `packageManager` - Enforces pnpm version via corepack
- Scripts delegate to Turborepo
- Minimal devDependencies (only turbo)

### pnpm-workspace.yaml

Defines where packages live:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

**Rules:**
- Globs match directories containing `package.json`
- Order doesn't matter
- Nested packages (like `apps/lunamark/packages/*`) need explicit entry if shared

---

## TypeScript Configuration

### Base Configuration (`tsconfig.base.json`)

Shared compiler options for the entire monorepo:

```json
{
  "compilerOptions": {
    // Target modern JavaScript (Node 20+)
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",

    // Strict type checking
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,

    // Module interop
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,

    // Declarations
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,

    // Performance
    "skipLibCheck": true
  },
  "exclude": ["node_modules", "dist", "build", ".turbo"]
}
```

### Per-Package Configuration

Each package extends the base:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### Why These Options?

| Option | Purpose |
|--------|---------|
| `moduleResolution: "bundler"` | Modern resolution for bundlers (Vite, tsup) |
| `noUncheckedIndexedAccess` | Forces null checks on array/object access |
| `verbatimModuleSyntax` | Ensures `import type` is used correctly |
| `isolatedModules` | Ensures compatibility with esbuild/swc |
| `skipLibCheck` | Faster builds (skip checking `*.d.ts` in node_modules) |

---

## Turborepo Task Pipeline

### Task Configuration (`turbo.json`)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$"]
    },
    "lint": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$"]
    },
    "check": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

### Task Behaviors

| Task | Caching | Depends On | Description |
|------|---------|------------|-------------|
| `build` | ✅ Cached | `^build` (dependencies first) | Production build |
| `dev` | ❌ Not cached | - | Development mode (persistent) |
| `test` | ✅ Cached | `^build` | Run tests |
| `lint` | ✅ Cached | `^build` | Lint code |
| `check` | ✅ Cached | `^build` | Type checking |
| `clean` | ❌ Not cached | - | Remove build artifacts |

### Understanding `^build`

The `^` prefix means "run this task in dependencies first":

```
@stargazer/cli depends on @stargazer/core
                    │
                    ▼
        turbo build runs:
        1. Build @stargazer/core first
        2. Then build @stargazer/cli
```

### Cache Behavior

Turborepo caches based on:
- Input files (source code)
- Environment variables
- Dependencies' outputs

```bash
# First build: ~30 seconds
$ pnpm build

# Second build (no changes): ~0.2 seconds (cache hit)
$ pnpm build
```

---

## Development Workflow

### Running Commands

```bash
# All packages (via Turborepo)
pnpm build              # Build all packages
pnpm test               # Test all packages
pnpm dev                # Dev mode for all

# Single package (via filter)
pnpm --filter @stargazer/cli build
pnpm --filter lunamark dev
pnpm --filter @stargazer/core test

# Multiple packages
pnpm --filter "@stargazer/*" build

# Shortcuts (defined in root package.json)
pnpm lunamark           # Dev lunamark app
```

### Filter Syntax

| Pattern | Matches |
|---------|---------|
| `@stargazer/cli` | Exact package name |
| `@stargazer/*` | All packages in namespace |
| `lunamark...` | Package and its dependencies |
| `...lunamark` | Package and its dependents |
| `./packages/*` | By path |

### Adding Dependencies

```bash
# Add to specific package
pnpm --filter @stargazer/cli add ink

# Add as dev dependency
pnpm --filter @stargazer/cli add -D @types/node

# Add internal dependency
pnpm --filter @stargazer/cli add @stargazer/core

# Add to root (workspace tools only)
pnpm add -D -w turbo
```

### Cache Management

```bash
# Clear Turborepo cache
pnpm turbo run clean

# Clear all (including node_modules)
pnpm clean

# View cache status
pnpm turbo run build --dry-run
```

---

## Adding New Packages

### Step-by-Step: New Shared Package

1. **Create directory structure:**

```bash
mkdir -p packages/new-package/src
```

2. **Create `package.json`:**

```json
{
  "name": "@stargazer/new-package",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./dist/index.js"
  },
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts",
    "dev": "tsup src/index.ts --format esm --watch",
    "test": "vitest run"
  },
  "dependencies": {},
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.7.0",
    "vitest": "^3.0.0"
  }
}
```

3. **Create `tsconfig.json`:**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

4. **Create entry point:**

```typescript
// src/index.ts
export function hello(): string {
  return "Hello from new-package";
}
```

5. **Install dependencies:**

```bash
pnpm install
```

6. **Verify it works:**

```bash
pnpm --filter @stargazer/new-package build
```

### Step-by-Step: New Application

1. **Create directory:**

```bash
mkdir -p apps/new-app/src
```

2. **Initialize with template or manually create `package.json`**

3. **Add workspace dependency:**

```json
{
  "dependencies": {
    "@stargazer/core": "workspace:*"
  }
}
```

4. **Configure build tool (Vite, etc.)**

5. **Run `pnpm install`**

---

## Decision Trees

### Should This Be a Package?

```
START
  │
  ▼
Is this code used by multiple apps/packages?
  │
  ├─ YES
  │   │
  │   ▼
  │   Does it have a clear, bounded responsibility?
  │     │
  │     ├─ YES ──► Create a package in packages/
  │     │
  │     └─ NO ──► Split into multiple focused packages
  │
  └─ NO
      │
      ▼
    Is it general-purpose utility code?
      │
      ├─ YES
      │   │
      │   ▼
      │   Will it likely be reused in the future?
      │     │
      │     ├─ YES ──► Create a package (preemptive)
      │     │
      │     └─ NO ──► Keep in the app that uses it
      │
      └─ NO ──► Keep in the app that uses it
```

### App vs Package?

```
START
  │
  ▼
Is it deployable on its own (web app, CLI, etc.)?
  │
  ├─ YES ──► Put in apps/
  │
  └─ NO
      │
      ▼
    Is it meant to be imported by other code?
      │
      ├─ YES ──► Put in packages/
      │
      └─ NO ──► Probably shouldn't exist as standalone
```

### Internal vs Published Package?

```
START
  │
  ▼
Will this ever be published to npm?
  │
  ├─ YES (or maybe)
  │   │
  │   ▼
  │   Use @stargazer/* namespace
  │   Can set private: false later
  │
  └─ NO (definitely internal)
      │
      ▼
    Use @repo/* namespace
    Always private: true
```

---

## Common Patterns

### Pattern 1: Workspace Protocol Dependencies

```json
{
  "dependencies": {
    "@stargazer/core": "workspace:*"
  }
}
```

**What `workspace:*` means:**
- Links to the local package (no npm download)
- Always uses latest local version
- Converted to actual version on publish

### Pattern 2: Shared React Version

Use pnpm overrides to ensure single React version:

```json
// Root package.json
{
  "pnpm": {
    "overrides": {
      "react": "^19.2.0",
      "react-dom": "^19.2.0"
    }
  }
}
```

### Pattern 3: Just-in-Time Packages

For packages consumed by bundlers (like UI components), export TypeScript directly:

```json
{
  "name": "@repo/ui",
  "exports": {
    "./button": "./src/button.tsx",
    "./card": "./src/card.tsx"
  }
}
```

**Benefits:**
- No build step needed
- Bundler handles transpilation
- Faster development

### Pattern 4: Package-Specific Scripts

Each package has consistent scripts:

```json
{
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts",
    "dev": "tsup src/index.ts --format esm --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "biome lint",
    "check": "biome check"
  }
}
```

---

## Anti-Patterns

### ❌ Cross-Package File Access

```typescript
// BAD: Reaching into another package's internals
import { helper } from "../../packages/core/src/utils/helper";

// GOOD: Import from package
import { helper } from "@stargazer/core";
```

### ❌ Circular Dependencies

```
@stargazer/core imports from @stargazer/cli
@stargazer/cli imports from @stargazer/core
              ↑___________________________|

// This will break builds and cause infinite loops
```

**Solution:** Extract shared code to a third package.

### ❌ Root-Level Source Code

```
# BAD: Source code at root
stargazer-monorepo/
├── src/
│   └── shared-utils.ts  # Where does this belong?
├── apps/
└── packages/

# GOOD: Code lives in packages
stargazer-monorepo/
├── apps/
├── packages/
│   └── utils/           # Proper package
│       └── src/
│           └── index.ts
```

### ❌ Inconsistent Naming

```json
// BAD: Mixed naming conventions
{
  "dependencies": {
    "@stargazer/core": "...",
    "lunamark-utils": "...",      // Different namespace
    "stargazer_action": "..."     // Underscores
  }
}

// GOOD: Consistent namespacing
{
  "dependencies": {
    "@stargazer/core": "...",
    "@stargazer/utils": "...",
    "@stargazer/action": "..."
  }
}
```

### ❌ God Packages

```
# BAD: Everything in one package
packages/
└── common/
    └── src/
        ├── api.ts
        ├── utils.ts
        ├── types.ts
        ├── components.tsx
        └── everything-else.ts

# GOOD: Focused packages
packages/
├── core/           # Business logic
├── api/            # API clients
├── types/          # Shared types
└── utils/          # Pure utilities
```

---

## Quick Reference

### File Locations

| Content Type | Location |
|--------------|----------|
| Web applications | `apps/[app-name]/` |
| Shared packages | `packages/[package-name]/` |
| Shared configs | `packages/tooling/` or root |
| Documentation | `docs/` or package-level |
| Architecture docs | Root level (`*.md`) |

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| App directory | kebab-case | `apps/lunamark/` |
| Package directory | kebab-case | `packages/core/` |
| npm package name | `@namespace/name` | `@stargazer/core` |
| Internal packages | `@repo/name` | `@repo/tooling` |

### Common Commands

```bash
# Development
pnpm dev                          # Start all in dev mode
pnpm --filter lunamark dev        # Start specific app

# Building
pnpm build                        # Build all
pnpm --filter @stargazer/cli build

# Testing
pnpm test                         # Test all
pnpm --filter @stargazer/core test

# Maintenance
pnpm clean                        # Clean all
pnpm install                      # Install/link all
```

---

## References

- [Turborepo Documentation](https://turborepo.com/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Bulletproof React](https://github.com/alan2207/bulletproof-react)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/modules/theory.html)

---

## Related Architecture Documents

| Document | Scope | Location |
|----------|-------|----------|
| `ARCHITECTURE_RULES.md` | React/TypeScript patterns | Root |
| `CLI_ARCHITECTURE.md` | CLI/TUI patterns | `packages/cli/` |
| `CLAUDE.md` | UI component patterns | `apps/lunamark/packages/ui/` |
| `MONOREPO_ARCHITECTURE.md` | Monorepo structure (this file) | Root |

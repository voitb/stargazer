---
id: task-062
title: Add Octokit dependency
status: todo
priority: medium
labels:
  - action
  - setup
created: '2026-01-01'
order: 620
---
## Description

Add required dependencies for the GitHub Action package.

## Acceptance Criteria

- [ ] Add @actions/core dependency
- [ ] Add @actions/github dependency
- [ ] Add @octokit/rest dependency
- [ ] Add @stargazer/core workspace dependency

## Implementation

**Commands:**

```bash
cd packages/action
pnpm add @actions/core @actions/github @octokit/rest
pnpm add @stargazer/core@workspace:*
```

**File**: `packages/action/package.json`

```json
{
  "name": "@stargazer/action",
  "version": "0.1.0",
  "private": true,
  "main": "dist/index.js",
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@actions/core": "^1.10.1",
    "@actions/github": "^6.0.0",
    "@octokit/rest": "^20.1.0",
    "@stargazer/core": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "tsup": "^8.0.0",
    "typescript": "^5.3.0"
  }
}
```

## Test

```bash
cd packages/action && pnpm install && pnpm typecheck
```

Dependencies installed and TypeScript compiles.

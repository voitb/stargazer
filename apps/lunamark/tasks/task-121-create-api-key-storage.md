---
id: task-121
title: Create API key storage utility
status: completed
priority: high
labels:
  - cli
  - tui
  - security
created: '2026-01-07'
order: 121
assignee: glm
---

## Description

Create utility functions to securely store and retrieve the Gemini API key in ~/.stargazer/config.json, similar to Claude Code and OpenCode.

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/storage/api-key-store.ts`
- [ ] Export `getApiKey()` that checks: 1) env var, 2) config file
- [ ] Export `saveApiKey(key)` that stores to config file with 600 permissions
- [ ] Export `hasApiKey()` boolean check
- [ ] Export `clearApiKey()` to remove stored key
- [ ] Config file format: `{ "apiKey": "...", "savedAt": "ISO date" }`

## Implementation

**File**: `packages/cli/src/tui/storage/api-key-store.ts`

```typescript
import { readFile, writeFile, chmod, access } from 'node:fs/promises';
import { ok, err, type Result } from '@stargazer/core';
import { getConfigPath, ensureStorageStructure } from './paths.js';

interface StoredConfig {
  apiKey?: string;
  savedAt?: string;
}

export async function getApiKey(): Promise<string | null> {
  const envKey = process.env['GEMINI_API_KEY'] || process.env['GOOGLE_API_KEY'];
  if (envKey) return envKey;

  try {
    const configPath = getConfigPath();
    const content = await readFile(configPath, 'utf-8');
    const config: StoredConfig = JSON.parse(content);
    return config.apiKey || null;
  } catch {
    return null;
  }
}

export async function saveApiKey(apiKey: string): Promise<Result<void>> {
  try {
    await ensureStorageStructure();
    const configPath = getConfigPath();

    const config: StoredConfig = {
      apiKey,
      savedAt: new Date().toISOString(),
    };

    await writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
    await chmod(configPath, 0o600);

    return ok(undefined);
  } catch (error) {
    return err({
      code: 'API_ERROR',
      message: `Failed to save API key: ${error}`,
    });
  }
}

export async function hasApiKey(): Promise<boolean> {
  const key = await getApiKey();
  return key !== null && key.length > 0;
}

export async function clearApiKey(): Promise<Result<void>> {
  try {
    const configPath = getConfigPath();
    await writeFile(configPath, JSON.stringify({}, null, 2), 'utf-8');
    return ok(undefined);
  } catch (error) {
    return err({
      code: 'API_ERROR',
      message: `Failed to clear API key: ${error}`,
    });
  }
}

export function maskApiKey(key: string): string {
  if (key.length <= 10) return '***';
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
```

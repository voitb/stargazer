---
id: task-054
title: Test resolveConfig
status: todo
assignee: voitb
priority: medium
labels:
  - core
  - config
  - testing
created: '2026-01-01'
order: 540
---
## Description

Create unit tests for the resolveConfig function.

## Acceptance Criteria

- [ ] Create `packages/core/src/config/resolve.test.ts`
- [ ] Test uses defaults when no config
- [ ] Test overrides specific values
- [ ] Test merges plugins correctly

## Implementation

**File**: `packages/core/src/config/resolve.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { resolveConfig, mergeIgnorePatterns } from './resolve';
import { DEFAULT_CONFIG } from './defaults';

describe('resolveConfig', () => {
  it('returns defaults when no config provided', () => {
    const config = resolveConfig();

    expect(config).toEqual(DEFAULT_CONFIG);
  });

  it('returns defaults when undefined passed', () => {
    const config = resolveConfig(undefined);

    expect(config).toEqual(DEFAULT_CONFIG);
  });

  it('overrides model when specified', () => {
    const config = resolveConfig({ model: 'gemini-2.0-pro' });

    expect(config.model).toBe('gemini-2.0-pro');
    expect(config.minSeverity).toBe(DEFAULT_CONFIG.minSeverity);
  });

  it('overrides minSeverity when specified', () => {
    const config = resolveConfig({ minSeverity: 'high' });

    expect(config.minSeverity).toBe('high');
    expect(config.model).toBe(DEFAULT_CONFIG.model);
  });

  it('overrides maxIssues when specified', () => {
    const config = resolveConfig({ maxIssues: 5 });

    expect(config.maxIssues).toBe(5);
  });

  it('overrides ignore patterns when specified', () => {
    const customIgnore = ['**/custom/**'];
    const config = resolveConfig({ ignore: customIgnore });

    expect(config.ignore).toEqual(customIgnore);
  });

  it('uses custom plugins when specified', () => {
    const mockPlugin = { name: 'test-plugin' };
    const config = resolveConfig({ plugins: [mockPlugin] });

    expect(config.plugins).toHaveLength(1);
    expect(config.plugins[0].name).toBe('test-plugin');
  });

  it('handles partial config with multiple overrides', () => {
    const config = resolveConfig({
      model: 'gemini-2.0-pro',
      minSeverity: 'medium',
      maxIssues: 10,
    });

    expect(config.model).toBe('gemini-2.0-pro');
    expect(config.minSeverity).toBe('medium');
    expect(config.maxIssues).toBe(10);
    expect(config.ignore).toEqual(DEFAULT_CONFIG.ignore);
    expect(config.plugins).toEqual(DEFAULT_CONFIG.plugins);
  });
});

describe('mergeIgnorePatterns', () => {
  it('merges two arrays', () => {
    const result = mergeIgnorePatterns(['a', 'b'], ['c', 'd']);

    expect(result).toEqual(['a', 'b', 'c', 'd']);
  });

  it('removes duplicates', () => {
    const result = mergeIgnorePatterns(['a', 'b'], ['b', 'c']);

    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('handles empty arrays', () => {
    expect(mergeIgnorePatterns([], ['a'])).toEqual(['a']);
    expect(mergeIgnorePatterns(['a'], [])).toEqual(['a']);
    expect(mergeIgnorePatterns([], [])).toEqual([]);
  });
});
```

## Test

```bash
cd packages/core && pnpm test resolve.test.ts
```

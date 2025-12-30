# Plugins

Stargazer uses a Vite-style plugin system - simple hooks that are easy to write and understand.

## Plugin Structure

A plugin is just a function that returns an object with optional hooks:

```typescript
import type { StargazerPlugin, PluginFactory } from '@stargazer/core';

// Define your plugin as a factory function
export const myPlugin: PluginFactory<{ option: string }> = (options) => ({
  name: 'my-plugin',

  // Optional hooks
  beforeReview: (ctx) => ctx,
  afterReview: (result) => result,
  filterIssues: (issues) => issues,
});
```

## Available Hooks

### `beforeReview`

Called before the AI review starts. Use to modify the review context.

```typescript
beforeReview?: (ctx: ReviewContext) => ReviewContext | Promise<ReviewContext>;
```

**Example: Add custom context**

```typescript
export const addContextPlugin: PluginFactory = () => ({
  name: 'add-context',
  beforeReview: (ctx) => ({
    ...ctx,
    customData: {
      timestamp: Date.now(),
      environment: 'production',
    },
  }),
});
```

### `afterReview`

Called after the AI review completes. Use to modify the review result.

```typescript
afterReview?: (result: ReviewResult, ctx: ReviewContext) => ReviewResult | Promise<ReviewResult>;
```

**Example: Add metadata**

```typescript
export const addMetadataPlugin: PluginFactory = () => ({
  name: 'add-metadata',
  afterReview: (result, ctx) => ({
    ...result,
    metadata: {
      reviewedAt: new Date().toISOString(),
      filesReviewed: ctx.changedFiles.length,
    },
  }),
});
```

### `filterIssues`

Called to filter or modify the issues found. Use to exclude or transform issues.

```typescript
filterIssues?: (issues: Issue[]) => Issue[];
```

**Example: Ignore paths**

```typescript
export const ignorePathsPlugin: PluginFactory<{ paths: string[] }> = (options) => ({
  name: 'ignore-paths',
  filterIssues: (issues) =>
    issues.filter(issue =>
      !options?.paths.some(path => issue.file.includes(path))
    ),
});
```

**Example: Upgrade severity**

```typescript
export const upgradeSeverityPlugin: PluginFactory<{ category: string }> = (options) => ({
  name: 'upgrade-severity',
  filterIssues: (issues) =>
    issues.map(issue =>
      issue.category === options?.category && issue.severity === 'medium'
        ? { ...issue, severity: 'high' }
        : issue
    ),
});
```

### `beforeDiscovery`

Called before convention discovery starts. Use to filter files.

```typescript
beforeDiscovery?: (files: FileContext[]) => FileContext[];
```

**Example: Focus on specific file types**

```typescript
export const typescriptOnlyPlugin: PluginFactory = () => ({
  name: 'typescript-only',
  beforeDiscovery: (files) =>
    files.filter(f => f.path.endsWith('.ts') || f.path.endsWith('.tsx')),
});
```

### `afterDiscovery`

Called after convention discovery completes. Use to modify discovered conventions.

```typescript
afterDiscovery?: (conventions: ProjectConventions) => ProjectConventions;
```

**Example: Add custom conventions**

```typescript
export const customConventionsPlugin: PluginFactory = () => ({
  name: 'custom-conventions',
  afterDiscovery: (conventions) => ({
    ...conventions,
    patterns: [
      ...conventions.patterns,
      {
        name: 'error-handling',
        description: 'Always use Result type for error handling',
        examples: [],
      },
    ],
  }),
});
```

## Using Plugins

Add plugins to your configuration:

```typescript
// stargazer.config.ts
import { defineConfig } from '@stargazer/core';
import { ignorePathsPlugin } from './plugins/ignore-paths';
import { upgradeSeverityPlugin } from './plugins/upgrade-severity';

export default defineConfig({
  model: 'gemini-2.0-flash',
  plugins: [
    ignorePathsPlugin({
      paths: ['/legacy/', '/generated/', '/vendor/'],
    }),
    upgradeSeverityPlugin({
      category: 'security',
    }),
  ],
});
```

## Plugin Execution Order

Plugins are executed in the order they are defined:

1. `beforeReview` hooks run in order (first plugin first)
2. AI review happens
3. `filterIssues` hooks run in order
4. `afterReview` hooks run in order

Each hook receives the output of the previous hook, allowing for composition:

```typescript
// Plugin 1 filterIssues output → Plugin 2 filterIssues input
export default defineConfig({
  plugins: [
    filterByPathPlugin({ paths: ['/test/'] }),    // Runs first
    filterBySeverityPlugin({ min: 'medium' }),     // Receives filtered output
    addMetadataPlugin(),                           // Receives further filtered output
  ],
});
```

## Best Practices

### Keep Plugins Focused

Each plugin should do one thing well:

```typescript
// GOOD - focused plugins
const ignoreTestsPlugin = () => ({ /* ... */ });
const upgradeSecurityPlugin = () => ({ /* ... */ });

// BAD - plugin doing too much
const doEverythingPlugin = () => ({
  beforeReview: /* ... */,
  afterReview: /* ... */,
  filterIssues: /* ... */,
  beforeDiscovery: /* ... */,
  afterDiscovery: /* ... */,
});
```

### Use TypeScript

Leverage TypeScript for type safety:

```typescript
import type { StargazerPlugin, PluginFactory, Issue } from '@stargazer/core';

interface IgnorePathsOptions {
  paths: string[];
  caseSensitive?: boolean;
}

export const ignorePathsPlugin: PluginFactory<IgnorePathsOptions> = (options) => ({
  name: 'ignore-paths',
  filterIssues: (issues: Issue[]): Issue[] => {
    const paths = options?.paths ?? [];
    const caseSensitive = options?.caseSensitive ?? false;

    return issues.filter(issue => {
      const filePath = caseSensitive ? issue.file : issue.file.toLowerCase();
      return !paths.some(p =>
        filePath.includes(caseSensitive ? p : p.toLowerCase())
      );
    });
  },
});
```

### Handle Errors Gracefully

Don't throw in hooks - return the input unchanged if something fails:

```typescript
export const safePlugin: PluginFactory = () => ({
  name: 'safe-plugin',
  filterIssues: (issues) => {
    try {
      // Your logic here
      return processIssues(issues);
    } catch (e) {
      console.error('Plugin error:', e);
      return issues; // Return input unchanged
    }
  },
});
```

## Publishing Plugins

To share your plugin:

1. Create a package with your plugin
2. Export the factory function
3. Document the options

```typescript
// @stargazer/plugin-security/src/index.ts
export { securityPlugin } from './security-plugin';
export type { SecurityPluginOptions } from './types';
```

```typescript
// Usage
import { securityPlugin } from '@stargazer/plugin-security';

export default defineConfig({
  plugins: [
    securityPlugin({
      strictMode: true,
    }),
  ],
});
```

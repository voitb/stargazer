---
id: task-163
title: Implement repository summary for agentic workflow
status: pending
priority: critical
labels:
  - cli
  - feature
  - agentic
created: '2025-01-10'
order: 163
assignee: ai-agent
depends_on: []
---

## Description

First-time run should create a comprehensive "repo summary" that the AI uses to understand the codebase. This enables more intelligent, context-aware responses and reviews.

## Requirements

1. Auto-run on first launch in a repo
2. Analyze: file structure, languages, frameworks, dependencies
3. Store summary for future sessions
4. Update on significant changes
5. Manual refresh command (`/repo refresh`)

## Summary Contents

The repo summary should include:
- Project type (frontend, backend, full-stack, library)
- Primary languages and their percentages
- Frameworks detected (React, Vue, Next.js, Express, etc.)
- Package manager (npm, yarn, pnpm)
- Entry points
- Test framework
- Build system
- Key directories and their purposes
- Important files (README, config files, etc.)
- Git information (branch, recent commits)

## Implementation

### Step 1: Create repo analyzer

**File:** `packages/cli/src/tui/utils/repo-analyzer.ts` (create)

```typescript
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import { existsSync } from 'node:fs';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export interface RepoSummary {
  /** When the summary was generated */
  generatedAt: string;
  /** Project root path */
  projectPath: string;

  /** Basic info */
  name: string;
  description?: string;
  version?: string;

  /** Project type */
  projectType: 'frontend' | 'backend' | 'fullstack' | 'library' | 'monorepo' | 'unknown';

  /** Languages detected with percentages */
  languages: Record<string, number>;
  primaryLanguage: string;

  /** Frameworks and libraries */
  frameworks: string[];
  dependencies: {
    production: string[];
    development: string[];
  };

  /** Package manager */
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun' | 'unknown';

  /** Entry points */
  entryPoints: string[];

  /** Testing */
  testFramework?: string;
  testDirectory?: string;

  /** Build */
  buildSystem?: string;
  buildCommand?: string;

  /** Key directories */
  directories: {
    source: string[];
    tests: string[];
    docs: string[];
    config: string[];
  };

  /** Important files */
  importantFiles: string[];

  /** Git info */
  git: {
    branch: string;
    recentCommits: Array<{ hash: string; message: string; date: string }>;
    hasUncommittedChanges: boolean;
  };

  /** File statistics */
  stats: {
    totalFiles: number;
    totalLines: number;
    filesByExtension: Record<string, number>;
  };
}

/**
 * Analyze a repository and generate summary
 */
export async function analyzeRepository(projectPath: string): Promise<RepoSummary> {
  const summary: Partial<RepoSummary> = {
    generatedAt: new Date().toISOString(),
    projectPath,
    languages: {},
    frameworks: [],
    dependencies: { production: [], development: [] },
    directories: { source: [], tests: [], docs: [], config: [] },
    importantFiles: [],
  };

  // Read package.json if exists
  const packageJsonPath = join(projectPath, 'package.json');
  if (existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
      summary.name = pkg.name;
      summary.description = pkg.description;
      summary.version = pkg.version;

      // Dependencies
      summary.dependencies!.production = Object.keys(pkg.dependencies || {});
      summary.dependencies!.development = Object.keys(pkg.devDependencies || {});

      // Detect frameworks
      const allDeps = [...summary.dependencies!.production, ...summary.dependencies!.development];
      summary.frameworks = detectFrameworks(allDeps);

      // Detect test framework
      summary.testFramework = detectTestFramework(allDeps);

      // Entry point
      if (pkg.main) summary.entryPoints = [pkg.main];

      // Build command
      if (pkg.scripts?.build) summary.buildCommand = 'npm run build';
    } catch {
      // Invalid package.json
    }
  }

  // Detect package manager
  summary.packageManager = detectPackageManager(projectPath);

  // Analyze file structure
  const files = await getAllProjectFiles(projectPath);
  summary.stats = calculateFileStats(files);
  summary.languages = calculateLanguages(files);
  summary.primaryLanguage = Object.entries(summary.languages!)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'unknown';

  // Detect project type
  summary.projectType = detectProjectType(summary.frameworks!, summary.directories!);

  // Find important files
  summary.importantFiles = findImportantFiles(projectPath);

  // Detect directories
  summary.directories = detectDirectories(projectPath, files);

  // Git info
  summary.git = await getGitInfo(projectPath);

  return summary as RepoSummary;
}

function detectFrameworks(deps: string[]): string[] {
  const frameworks: string[] = [];

  // Frontend frameworks
  if (deps.includes('react')) frameworks.push('React');
  if (deps.includes('vue')) frameworks.push('Vue');
  if (deps.includes('svelte')) frameworks.push('Svelte');
  if (deps.includes('angular')) frameworks.push('Angular');

  // Meta-frameworks
  if (deps.includes('next')) frameworks.push('Next.js');
  if (deps.includes('nuxt')) frameworks.push('Nuxt');
  if (deps.includes('@sveltejs/kit')) frameworks.push('SvelteKit');

  // Backend frameworks
  if (deps.includes('express')) frameworks.push('Express');
  if (deps.includes('fastify')) frameworks.push('Fastify');
  if (deps.includes('koa')) frameworks.push('Koa');
  if (deps.includes('hono')) frameworks.push('Hono');
  if (deps.includes('nestjs') || deps.includes('@nestjs/core')) frameworks.push('NestJS');

  // Other
  if (deps.includes('electron')) frameworks.push('Electron');
  if (deps.includes('ink')) frameworks.push('Ink (CLI)');

  return frameworks;
}

function detectTestFramework(deps: string[]): string | undefined {
  if (deps.includes('vitest')) return 'Vitest';
  if (deps.includes('jest')) return 'Jest';
  if (deps.includes('mocha')) return 'Mocha';
  if (deps.includes('ava')) return 'AVA';
  if (deps.includes('playwright')) return 'Playwright';
  if (deps.includes('cypress')) return 'Cypress';
  return undefined;
}

function detectPackageManager(projectPath: string): RepoSummary['packageManager'] {
  if (existsSync(join(projectPath, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(join(projectPath, 'yarn.lock'))) return 'yarn';
  if (existsSync(join(projectPath, 'bun.lockb'))) return 'bun';
  if (existsSync(join(projectPath, 'package-lock.json'))) return 'npm';
  return 'unknown';
}

function detectProjectType(frameworks: string[], dirs: RepoSummary['directories']): RepoSummary['projectType'] {
  const hasFrontend = frameworks.some(f =>
    ['React', 'Vue', 'Svelte', 'Angular', 'Next.js', 'Nuxt'].includes(f)
  );
  const hasBackend = frameworks.some(f =>
    ['Express', 'Fastify', 'Koa', 'NestJS', 'Hono'].includes(f)
  );

  if (hasFrontend && hasBackend) return 'fullstack';
  if (hasFrontend) return 'frontend';
  if (hasBackend) return 'backend';

  return 'unknown';
}

async function getAllProjectFiles(projectPath: string, maxDepth = 4): Promise<string[]> {
  // Implementation similar to file-search.ts
  // Returns relative paths of all project files
  return [];
}

function calculateFileStats(files: string[]): RepoSummary['stats'] {
  // Calculate file statistics
  return { totalFiles: files.length, totalLines: 0, filesByExtension: {} };
}

function calculateLanguages(files: string[]): Record<string, number> {
  // Calculate language percentages based on file extensions
  return {};
}

function findImportantFiles(projectPath: string): string[] {
  const important = [
    'README.md', 'README', 'readme.md',
    'package.json', 'tsconfig.json', 'vite.config.ts',
    '.env.example', '.gitignore',
    'Dockerfile', 'docker-compose.yml',
  ];
  return important.filter(f => existsSync(join(projectPath, f)));
}

function detectDirectories(projectPath: string, files: string[]): RepoSummary['directories'] {
  return {
    source: ['src', 'app', 'lib'].filter(d => existsSync(join(projectPath, d))),
    tests: ['test', 'tests', '__tests__', 'spec'].filter(d => existsSync(join(projectPath, d))),
    docs: ['docs', 'documentation'].filter(d => existsSync(join(projectPath, d))),
    config: ['config', '.config'].filter(d => existsSync(join(projectPath, d))),
  };
}

async function getGitInfo(projectPath: string): Promise<RepoSummary['git']> {
  try {
    const { stdout: branch } = await execAsync('git rev-parse --abbrev-ref HEAD', { cwd: projectPath });
    const { stdout: log } = await execAsync('git log -5 --pretty=format:"%h|%s|%ci"', { cwd: projectPath });
    const { stdout: status } = await execAsync('git status --porcelain', { cwd: projectPath });

    const commits = log.trim().split('\n').map(line => {
      const [hash, message, date] = line.split('|');
      return { hash, message, date };
    });

    return {
      branch: branch.trim(),
      recentCommits: commits,
      hasUncommittedChanges: status.trim().length > 0,
    };
  } catch {
    return {
      branch: 'unknown',
      recentCommits: [],
      hasUncommittedChanges: false,
    };
  }
}
```

### Step 2: Create repo summary storage

**File:** `packages/cli/src/tui/storage/repo-summary-store.ts` (create)

```typescript
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { createHash } from 'node:crypto';
import { analyzeRepository, type RepoSummary } from '../utils/repo-analyzer.js';

const CACHE_DIR = join(homedir(), '.stargazer', 'cache', 'repo-summaries');

/**
 * Get cache file path for a project
 */
function getCachePath(projectPath: string): string {
  const hash = createHash('md5').update(projectPath).digest('hex');
  return join(CACHE_DIR, `${hash}.json`);
}

/**
 * Get repo summary (from cache or generate new)
 */
export async function getRepoSummary(
  projectPath: string,
  forceRefresh = false
): Promise<RepoSummary> {
  await mkdir(CACHE_DIR, { recursive: true });

  const cachePath = getCachePath(projectPath);

  // Check cache
  if (!forceRefresh && existsSync(cachePath)) {
    const cached = JSON.parse(await readFile(cachePath, 'utf-8')) as RepoSummary;

    // Check if cache is still valid (less than 24 hours old)
    const cacheAge = Date.now() - new Date(cached.generatedAt).getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (cacheAge < maxAge) {
      return cached;
    }
  }

  // Generate new summary
  const summary = await analyzeRepository(projectPath);

  // Save to cache
  await writeFile(cachePath, JSON.stringify(summary, null, 2));

  return summary;
}

/**
 * Check if repo summary exists
 */
export function hasRepoSummary(projectPath: string): boolean {
  return existsSync(getCachePath(projectPath));
}

/**
 * Clear repo summary cache
 */
export async function clearRepoSummary(projectPath: string): Promise<void> {
  const cachePath = getCachePath(projectPath);
  if (existsSync(cachePath)) {
    const { unlink } = await import('node:fs/promises');
    await unlink(cachePath);
  }
}
```

### Step 3: Add repo summary to system prompt

**File:** `packages/cli/src/tui/utils/system-prompt.ts` (create)

```typescript
import { type RepoSummary } from './repo-analyzer.js';

/**
 * Generate system prompt including repo context
 */
export function generateSystemPrompt(summary: RepoSummary): string {
  return `You are an expert code assistant helping with a ${summary.projectType} project.

## Project Overview
- **Name**: ${summary.name}
- **Type**: ${summary.projectType}
- **Primary Language**: ${summary.primaryLanguage}
- **Frameworks**: ${summary.frameworks.join(', ') || 'None detected'}
- **Package Manager**: ${summary.packageManager}
${summary.testFramework ? `- **Test Framework**: ${summary.testFramework}` : ''}

## Project Structure
- **Source directories**: ${summary.directories.source.join(', ') || 'Not detected'}
- **Test directories**: ${summary.directories.tests.join(', ') || 'Not detected'}
- **Entry points**: ${summary.entryPoints?.join(', ') || 'Not detected'}

## Key Files
${summary.importantFiles.map(f => `- ${f}`).join('\n')}

## Dependencies
Main dependencies: ${summary.dependencies.production.slice(0, 20).join(', ')}

## Git Status
- **Branch**: ${summary.git.branch}
- **Has uncommitted changes**: ${summary.git.hasUncommittedChanges ? 'Yes' : 'No'}

## Recent Activity
${summary.git.recentCommits.slice(0, 3).map(c => `- ${c.hash}: ${c.message}`).join('\n')}

---

When helping with this project:
1. Use the project's conventions and patterns
2. Consider the frameworks in use
3. Follow the testing patterns if tests are requested
4. Be aware of the project structure
`;
}
```

### Step 4: Integrate with app initialization

**File:** `packages/cli/src/tui/app.tsx`

Add repo summary on first launch:

```typescript
import { getRepoSummary, hasRepoSummary } from './storage/repo-summary-store.js';

// In AppContent:
const [repoSummary, setRepoSummary] = useState<RepoSummary | null>(null);
const [isAnalyzing, setIsAnalyzing] = useState(false);

useEffect(() => {
  const init = async () => {
    // Check if this is first run
    if (!hasRepoSummary(projectPath)) {
      setIsAnalyzing(true);
      // Show analyzing screen
      navigate('analyzing');
    }

    // Get or generate summary
    const summary = await getRepoSummary(projectPath);
    setRepoSummary(summary);
    setIsAnalyzing(false);

    // Continue with normal init
    // ...
  };
  init();
}, [projectPath]);
```

### Step 5: Add analyzing screen

**File:** `packages/cli/src/tui/screens/analyzing-screen.tsx` (create)

```typescript
import { Box, Text } from 'ink';
import { StarSpinner, ScreenTitle } from '../design-system/index.js';

export function AnalyzingScreen() {
  return (
    <Box flexDirection="column" padding={2} alignItems="center">
      <ScreenTitle>Analyzing Repository</ScreenTitle>
      <Box marginY={2}>
        <StarSpinner />
        <Text> Scanning project structure...</Text>
      </Box>
      <Text dimColor>This only happens once per project.</Text>
    </Box>
  );
}
```

## Acceptance Criteria

- [ ] First run triggers repo analysis
- [ ] Summary is cached and reused
- [ ] `/repo` command shows summary
- [ ] `/repo refresh` regenerates summary
- [ ] Summary includes all required info
- [ ] System prompt uses repo context
- [ ] Cache invalidates after 24 hours

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit

# Manual test:
# 1. Delete ~/.stargazer/cache/
# 2. Start CLI in a repo
# 3. Verify analyzing screen shows
# 4. Verify summary is cached
# 5. Restart CLI - should skip analysis
# 6. Use /repo to see summary
# 7. Use /repo refresh to regenerate
```

## Files Changed

- CREATE: `packages/cli/src/tui/utils/repo-analyzer.ts`
- CREATE: `packages/cli/src/tui/storage/repo-summary-store.ts`
- CREATE: `packages/cli/src/tui/utils/system-prompt.ts`
- CREATE: `packages/cli/src/tui/screens/analyzing-screen.tsx`
- UPDATE: `packages/cli/src/tui/app.tsx`
- UPDATE: `packages/cli/src/tui/screens/screen-router.tsx`
- UPDATE: `packages/cli/src/tui/state/navigation-context.tsx`
- UPDATE: `packages/cli/src/tui/features/chat/commands/registry.ts`

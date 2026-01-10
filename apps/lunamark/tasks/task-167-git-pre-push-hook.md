---
id: task-167
title: Implement git pre-push hook for code review
status: pending
priority: medium
labels:
  - cli
  - feature
  - git
created: '2025-01-10'
order: 167
assignee: ai-agent
depends_on: []
---

## Description

Run code review before git push (like Husky). Block push if critical issues are found, with configurable severity threshold.

## Requirements

1. Install hook via `stargazer init`
2. Run review on commits being pushed
3. Block push if critical issues found
4. Configurable severity threshold
5. Bypass flag (`--no-verify`)
6. Clear output showing review results

## Implementation

### Step 1: Create hook installer

**File:** `packages/cli/src/commands/init.ts`

```typescript
import { writeFile, mkdir, chmod, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

const PRE_PUSH_HOOK = `#!/bin/sh
# Stargazer pre-push hook

# Skip if --no-verify flag is used (handled by git)
# This hook will not run when --no-verify is passed

# Get the directory of this script
HOOK_DIR="$(dirname "$0")"
REPO_ROOT="$(git rev-parse --show-toplevel)"

# Run stargazer review
echo "🔍 Running Stargazer code review..."
npx stargazer review --pre-push

# Check exit code
if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Push blocked due to code review issues."
  echo "Fix the issues above or use 'git push --no-verify' to bypass."
  exit 1
fi

echo "✅ Code review passed!"
exit 0
`;

export async function initHooks(projectPath: string): Promise<void> {
  const gitDir = join(projectPath, '.git');
  const hooksDir = join(gitDir, 'hooks');

  // Check if git repo
  if (!existsSync(gitDir)) {
    throw new Error('Not a git repository. Run `git init` first.');
  }

  // Ensure hooks directory exists
  await mkdir(hooksDir, { recursive: true });

  // Write pre-push hook
  const prePushPath = join(hooksDir, 'pre-push');
  await writeFile(prePushPath, PRE_PUSH_HOOK, 'utf-8');
  await chmod(prePushPath, 0o755); // Make executable

  console.log('✅ Stargazer pre-push hook installed');
  console.log(`   Location: ${prePushPath}`);
}

export async function removeHooks(projectPath: string): Promise<void> {
  const prePushPath = join(projectPath, '.git', 'hooks', 'pre-push');

  if (existsSync(prePushPath)) {
    const content = await readFile(prePushPath, 'utf-8');
    if (content.includes('Stargazer')) {
      const { unlink } = await import('node:fs/promises');
      await unlink(prePushPath);
      console.log('✅ Stargazer pre-push hook removed');
    } else {
      console.log('⚠️ pre-push hook exists but was not installed by Stargazer');
    }
  } else {
    console.log('ℹ️ No pre-push hook found');
  }
}
```

### Step 2: Create pre-push review command

**File:** `packages/cli/src/commands/review.ts`

Add pre-push mode:

```typescript
import { program } from 'commander';
import { reviewCode } from '@stargazer/ai-providers';
import { getGitDiff } from '../utils/git.js';

interface ReviewOptions {
  prePush?: boolean;
  threshold?: 'critical' | 'high' | 'medium' | 'low';
}

export function registerReviewCommand() {
  program
    .command('review')
    .description('Run code review')
    .option('--pre-push', 'Run as pre-push hook')
    .option('--threshold <level>', 'Minimum severity to block (default: critical)')
    .action(async (options: ReviewOptions) => {
      if (options.prePush) {
        await runPrePushReview(options);
      } else {
        // Regular review
        console.log('Use TUI for interactive review');
      }
    });
}

async function runPrePushReview(options: ReviewOptions): Promise<void> {
  const threshold = options.threshold || 'critical';

  // Get commits being pushed
  // Note: In pre-push hook, we get refs from stdin
  // For simplicity, we review the diff against origin/main

  const diff = await getGitDiff('origin/main...HEAD');

  if (!diff.trim()) {
    console.log('No changes to review');
    process.exit(0);
  }

  console.log('Reviewing changes...\n');

  try {
    const result = await reviewCode({
      diff,
      mode: 'pre-push',
    });

    // Display results
    if (result.issues.length === 0) {
      console.log('No issues found!');
      process.exit(0);
    }

    // Group by severity
    const bySeverity = {
      critical: result.issues.filter(i => i.severity === 'critical'),
      high: result.issues.filter(i => i.severity === 'high'),
      medium: result.issues.filter(i => i.severity === 'medium'),
      low: result.issues.filter(i => i.severity === 'low'),
    };

    // Display issues
    for (const [severity, issues] of Object.entries(bySeverity)) {
      if (issues.length > 0) {
        console.log(`\n${getSeverityEmoji(severity)} ${severity.toUpperCase()} (${issues.length}):`);
        for (const issue of issues) {
          console.log(`  • ${issue.file}:${issue.line} - ${issue.message}`);
        }
      }
    }

    // Check if should block
    const severityOrder = ['low', 'medium', 'high', 'critical'];
    const thresholdIndex = severityOrder.indexOf(threshold);

    const blockingIssues = result.issues.filter(i => {
      const issueIndex = severityOrder.indexOf(i.severity);
      return issueIndex >= thresholdIndex;
    });

    if (blockingIssues.length > 0) {
      console.log(`\n❌ Found ${blockingIssues.length} issue(s) at or above '${threshold}' severity`);
      process.exit(1);
    }

    console.log('\n✅ No blocking issues found');
    process.exit(0);

  } catch (error) {
    console.error('Review failed:', error);
    // Don't block on review errors - allow push to continue
    console.log('⚠️ Review failed, allowing push to continue');
    process.exit(0);
  }
}

function getSeverityEmoji(severity: string): string {
  switch (severity) {
    case 'critical': return '🔴';
    case 'high': return '🟠';
    case 'medium': return '🟡';
    case 'low': return '🟢';
    default: return '⚪';
  }
}
```

### Step 3: Create git utility

**File:** `packages/cli/src/utils/git.ts`

```typescript
import { execFileNoThrow } from './execFileNoThrow.js';

/**
 * Get git diff between two refs
 * Uses execFileNoThrow for security
 */
export async function getGitDiff(range: string): Promise<string> {
  const result = await execFileNoThrow('git', ['diff', range]);
  if (result.status !== 0) {
    throw new Error(`git diff failed: ${result.stderr}`);
  }
  return result.stdout;
}

/**
 * Check if there are uncommitted changes
 */
export async function hasUncommittedChanges(): Promise<boolean> {
  const result = await execFileNoThrow('git', ['status', '--porcelain']);
  return result.stdout.trim().length > 0;
}

/**
 * Get current branch name
 */
export async function getCurrentBranch(): Promise<string> {
  const result = await execFileNoThrow('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  return result.stdout.trim();
}
```

### Step 4: Add init command to CLI

**File:** `packages/cli/src/index.tsx`

```typescript
import { initHooks, removeHooks } from './commands/init.js';

program
  .command('init')
  .description('Initialize Stargazer in current repository')
  .option('--hooks', 'Install git hooks')
  .action(async (options) => {
    if (options.hooks) {
      await initHooks(process.cwd());
    } else {
      console.log('Available init options:');
      console.log('  --hooks    Install git pre-push hook');
    }
  });

program
  .command('remove-hooks')
  .description('Remove Stargazer git hooks')
  .action(async () => {
    await removeHooks(process.cwd());
  });
```

## Acceptance Criteria

- [ ] `stargazer init --hooks` installs pre-push hook
- [ ] Hook runs review on `git push`
- [ ] Push is blocked if critical issues found
- [ ] `--no-verify` bypasses the hook
- [ ] Clear output showing what issues were found
- [ ] Configurable severity threshold
- [ ] `stargazer remove-hooks` removes the hook

## Test

```bash
# Install hook
cd /your/repo
stargazer init --hooks

# Test
git add .
git commit -m "test"
git push  # Should run review

# Bypass
git push --no-verify

# Remove
stargazer remove-hooks
```

## Files Changed

- CREATE: `packages/cli/src/commands/init.ts`
- UPDATE: `packages/cli/src/commands/review.ts`
- CREATE: `packages/cli/src/utils/git.ts`
- UPDATE: `packages/cli/src/index.tsx`

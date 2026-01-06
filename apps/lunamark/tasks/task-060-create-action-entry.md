---
id: task-060
title: Create action entry
status: todo
assignee: voitb
priority: high
labels:
  - action
created: '2026-01-01'
order: 600
---
## Description

Create the main entry point for the GitHub Action.

## Acceptance Criteria

- [ ] Create `packages/action/src/index.ts`
- [ ] Get inputs from GitHub Actions context
- [ ] Call Stargazer to review PR diff
- [ ] Post formatted comment to PR

## Implementation

**File**: `packages/action/src/index.ts`

```typescript
import * as core from '@actions/core';
import * as github from '@actions/github';
import { createStargazer } from '@stargazer/core';
import { createGitHubClient } from './github/client';
import { formatReviewAsMarkdown } from './format';

async function run(): Promise<void> {
  try {
    // Get inputs
    const apiKey = core.getInput('gemini-api-key', { required: true });
    const githubToken = core.getInput('github-token');
    const minSeverity = core.getInput('min-severity') || 'low';
    const maxIssues = parseInt(core.getInput('max-issues') || '20', 10);

    // Check if this is a PR
    const context = github.context;
    if (!context.payload.pull_request) {
      core.info('Not a pull request, skipping review');
      return;
    }

    const prNumber = context.payload.pull_request.number;
    const { owner, repo } = context.repo;

    core.info(`Reviewing PR #${prNumber}...`);

    // Get PR diff
    const gh = createGitHubClient(githubToken);
    const diff = await gh.getPRDiff({ owner, repo, prNumber });

    if (!diff.trim()) {
      core.info('No changes to review');
      return;
    }

    // Create Stargazer and review
    const stargazerResult = createStargazer({
      apiKey,
      config: {
        minSeverity: minSeverity as any,
        maxIssues,
      },
    });

    if (!stargazerResult.ok) {
      core.setFailed(stargazerResult.error.message);
      return;
    }

    const reviewResult = await stargazerResult.data.review({ diff });

    if (!reviewResult.ok) {
      core.setFailed(reviewResult.error.message);
      return;
    }

    // Post comment
    const comment = formatReviewAsMarkdown(reviewResult.data);
    await gh.postComment({ owner, repo, prNumber }, comment);

    // Set outputs
    core.setOutput('issues-count', reviewResult.data.issues.length);
    core.setOutput('decision', reviewResult.data.decision);

    core.info(`Review posted: ${reviewResult.data.issues.length} issue(s) found`);
    core.info(`Decision: ${reviewResult.data.decision}`);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed(String(error));
    }
  }
}

run();
```

## Test

```bash
cd packages/action && pnpm tsc --noEmit
```

TypeScript compiles without errors.

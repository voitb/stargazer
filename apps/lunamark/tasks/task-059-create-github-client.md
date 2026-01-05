---
id: task-059
title: Create GitHub client
status: todo
assignee: voitb
priority: high
labels:
  - action
  - github
created: '2026-01-01'
order: 590
---
## Description

Create a client for GitHub API interactions.

## Acceptance Criteria

- [ ] Create `packages/action/src/github/client.ts`
- [ ] Implement PR diff fetching
- [ ] Implement comment posting
- [ ] Use Octokit for API calls

## Implementation

**File**: `packages/action/src/github/client.ts`

```typescript
import { Octokit } from '@octokit/rest';

export type GitHubContext = {
  readonly owner: string;
  readonly repo: string;
  readonly prNumber: number;
};

export function createGitHubClient(token: string) {
  const octokit = new Octokit({ auth: token });

  return {
    /**
     * Get the diff for a pull request.
     */
    async getPRDiff(ctx: GitHubContext): Promise<string> {
      const { data } = await octokit.pulls.get({
        owner: ctx.owner,
        repo: ctx.repo,
        pull_number: ctx.prNumber,
        mediaType: { format: 'diff' },
      });

      // When requesting diff format, data is the raw diff string
      return data as unknown as string;
    },

    /**
     * Post a comment on a pull request.
     */
    async postComment(ctx: GitHubContext, body: string): Promise<void> {
      await octokit.issues.createComment({
        owner: ctx.owner,
        repo: ctx.repo,
        issue_number: ctx.prNumber,
        body,
      });
    },

    /**
     * Get list of files changed in a PR.
     */
    async getChangedFiles(ctx: GitHubContext): Promise<string[]> {
      const { data } = await octokit.pulls.listFiles({
        owner: ctx.owner,
        repo: ctx.repo,
        pull_number: ctx.prNumber,
      });

      return data.map((file) => file.filename);
    },
  };
}

export type GitHubClient = ReturnType<typeof createGitHubClient>;
```

## Test

```bash
cd packages/action && pnpm tsc --noEmit
```

TypeScript compiles without errors.

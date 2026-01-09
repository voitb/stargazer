import { Octokit } from '@octokit/rest';

export type GitHubContext = {
  readonly owner: string;
  readonly repo: string;
  readonly prNumber: number;
};

export function createGitHubClient(token: string) {
  const octokit = new Octokit({ auth: token });

  return {
    async getPRDiff(ctx: GitHubContext): Promise<string> {
      const { data } = await octokit.pulls.get({
        owner: ctx.owner,
        repo: ctx.repo,
        pull_number: ctx.prNumber,
        mediaType: { format: 'diff' },
      });

      // Octokit returns raw diff string when mediaType.format is 'diff'
      // but TypeScript types it as the PR object, so we validate at runtime
      if (typeof data !== 'string') {
        throw new Error(
          `Expected diff string from GitHub API, got ${typeof data}`
        );
      }
      return data;
    },

    async postComment(ctx: GitHubContext, body: string): Promise<void> {
      await octokit.issues.createComment({
        owner: ctx.owner,
        repo: ctx.repo,
        issue_number: ctx.prNumber,
        body,
      });
    },

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

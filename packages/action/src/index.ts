import * as core from '@actions/core';
import * as github from '@actions/github';
import { createStargazer } from '@stargazer/core';
import { createGitHubClient } from './github/client';
import { formatReviewAsMarkdown } from './format';

async function run(): Promise<void> {
  try {
    const apiKey = core.getInput('gemini-api-key', { required: true });
    const githubToken = core.getInput('github-token');
    const minSeverity = core.getInput('min-severity') || 'low';
    const maxIssues = parseInt(core.getInput('max-issues') || '20', 10);

    const context = github.context;
    if (!context.payload.pull_request) {
      core.info('Not a pull request, skipping review');
      return;
    }

    const prNumber = context.payload.pull_request.number;
    const { owner, repo } = context.repo;

    core.info(`Reviewing PR #${prNumber}...`);

    const gh = createGitHubClient(githubToken);
    const diff = await gh.getPRDiff({ owner, repo, prNumber });

    if (!diff.trim()) {
      core.info('No changes to review');
      return;
    }

    const stargazerResult = createStargazer({
      apiKey,
      config: {
        minSeverity: minSeverity as 'critical' | 'high' | 'medium' | 'low',
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

    const comment = formatReviewAsMarkdown(reviewResult.data);
    await gh.postComment({ owner, repo, prNumber }, comment);

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

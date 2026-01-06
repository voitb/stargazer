import { Command } from 'commander';
import { stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createGeminiClient } from '@stargazer/core/gemini/client';
import { reviewDiff } from '@stargazer/core/review/reviewer';
import { formatReview as formatTerminal } from '../output/terminal';
import { formatReview as formatMarkdown } from '../output/markdown';
import { exitWithError, exitWithResult } from '../exit-codes';
import { logger } from '../logger';
import ora from 'ora';
import type { ReviewResult } from '@stargazer/core';

type OutputFormat = 'terminal' | 'json' | 'markdown';

const formatters: Record<OutputFormat, (review: ReviewResult) => string> = {
  terminal: formatTerminal,
  json: (review) => JSON.stringify(review, null, 2),
  markdown: formatMarkdown,
};

export const reviewCommand = new Command('review')
  .description('Review staged changes using AI')
  .option('--unstaged', 'Review unstaged changes instead of staged')
  .option('--staged', 'Review staged changes (default)')
  .option('-p, --path <directory>', 'Project directory to review', process.cwd())
  .option(
    '-f, --format <format>',
    'Output format: terminal, json, markdown',
    'terminal'
  )
  .option(
    '-m, --model <model>',
    'Gemini model to use (e.g., gemini-2.5-flash, gemini-3-flash-preview)'
  )
  .addHelpText('after', `
Examples:
  $ stargazer review                    Review staged changes
  $ stargazer review --unstaged         Review unstaged changes
  $ stargazer review -f json            Output as JSON
  $ stargazer review -f markdown > review.md
`)
  .action(async (options) => {
    const apiKey = process.env['GEMINI_API_KEY'];

    if (!apiKey) {
      exitWithError(
        'GEMINI_API_KEY environment variable is required\nSet it with: export GEMINI_API_KEY=your-key'
      );
    }

    if (options.staged && options.unstaged) {
      exitWithError('Cannot use both --staged and --unstaged');
    }

    const format = options.format as OutputFormat;
    if (!formatters[format]) {
      exitWithError(`Invalid format "${format}". Use: terminal, json, markdown`);
    }

    // Validate and resolve project path
    const projectPath = resolve(options.path);
    try {
      const stats = await stat(projectPath);
      if (!stats.isDirectory()) {
        exitWithError(`Path is not a directory: ${projectPath}`);
      }
    } catch {
      exitWithError(`Path does not exist: ${projectPath}`);
    }

    const spinner = ora('Analyzing code changes...').start();

    try {
      const client = createGeminiClient(apiKey, options.model);

      const result = await reviewDiff(client, {
        staged: !options.unstaged,
        projectPath,
      });

      spinner.stop();

      if (!result.ok) {
        exitWithError(result.error.message);
      }

      const formatter = formatters[format];
      logger.info(formatter(result.data));

      exitWithResult(result.data.issues.length);
    } catch (error) {
      spinner.fail('Review failed');
      exitWithError(`Unexpected error: ${error}`);
    }
  });

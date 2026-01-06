import { Command } from 'commander';
import { createGeminiClient } from '@stargazer/core/gemini/client';
import { reviewDiff } from '@stargazer/core/review/reviewer';
import { formatReview as formatTerminal } from '../output/terminal';
import { formatReview as formatMarkdown } from '../output/markdown';
import { exitWithError, exitWithResult } from '../exit-codes';
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
  .option(
    '-f, --format <format>',
    'Output format: terminal, json, markdown',
    'terminal'
  )
  .option(
    '-m, --model <model>',
    'Gemini model to use (e.g., gemini-2.5-flash, gemini-3-flash-preview)'
  )
  .action(async (options) => {
    const apiKey = process.env['GEMINI_API_KEY'];

    if (!apiKey) {
      exitWithError(
        'GEMINI_API_KEY environment variable is required\nSet it with: export GEMINI_API_KEY=your-key'
      );
    }

    const format = options.format as OutputFormat;
    if (!formatters[format]) {
      exitWithError(`Invalid format "${format}". Use: terminal, json, markdown`);
    }

    try {
      const client = createGeminiClient(apiKey, options.model);

      const result = await reviewDiff(client, {
        staged: !options.unstaged,
        projectPath: process.cwd(),
      });

      if (!result.ok) {
        exitWithError(result.error.message);
      }

      const formatter = formatters[format];
      console.log(formatter(result.data));

      exitWithResult(result.data.issues.length);
    } catch (error) {
      exitWithError(`Unexpected error: ${error}`);
    }
  });

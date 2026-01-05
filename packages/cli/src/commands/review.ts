import { Command } from 'commander';
import { createGeminiClient } from '@stargazer/core/gemini/client';
import { reviewDiff } from '@stargazer/core/review/reviewer';
import { formatReview } from '../output/terminal';

export const reviewCommand = new Command('review')
  .description('Review staged changes using AI')
  .option('--unstaged', 'Review unstaged changes instead of staged')
  .option('--json', 'Output raw JSON instead of formatted text')
  .action(async (options) => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('Error: GEMINI_API_KEY environment variable is required');
      console.error('Set it with: export GEMINI_API_KEY=your-key');
      process.exit(2);
    }

    try {
      const client = createGeminiClient(apiKey);

      const result = await reviewDiff(client, {
        staged: !options.unstaged,
      });

      if (!result.ok) {
        console.error(`Error: ${result.error.message}`);
        process.exit(2);
      }

      if (options.json) {
        console.log(JSON.stringify(result.data, null, 2));
      } else {
        console.log(formatReview(result.data));
      }

      process.exit(result.data.issues.length > 0 ? 1 : 0);
    } catch (error) {
      console.error('Unexpected error:', error);
      process.exit(2);
    }
  });

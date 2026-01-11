import { Command } from 'commander';
import { writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import chalk from 'chalk';
import { logger } from '../logger.js';
import { exitWithError } from '../exit-codes.js';

const CONFIG_TEMPLATE = `import { defineConfig, ignorePathsPlugin } from '@stargazer/core';

export default defineConfig({
  model: 'gemini-3-flash-preview',
  minSeverity: 'low',
  maxIssues: 20,
  ignore: [
    '**/test/**',
    '**/*.test.ts',
  ],
  plugins: [],
});
`;

export function createInitCommand(): Command {
  return new Command('init')
    .description('Initialize Stargazer configuration file')
    .option('--force', 'Overwrite existing config file')
    .addHelpText(
      'after',
      `
Examples:
  $ stargazer init                Create config file
  $ stargazer init --force        Overwrite existing config
`
    )
    .action(async (options) => {
      const configPath = join(process.cwd(), 'stargazer.config.ts');

      if (!options.force) {
        try {
          await access(configPath);
          logger.warn('Config file already exists: stargazer.config.ts');
          logger.info(chalk.dim('Use --force to overwrite'));
          exitWithError('Config file already exists');
        } catch {
          // File doesn't exist, continue with creation
        }
      }

      try {
        await writeFile(configPath, CONFIG_TEMPLATE, 'utf-8');

        logger.success('✓ Created stargazer.config.ts');
        logger.info('');
        logger.info(chalk.bold('Next steps:'));
        logger.info('');
        logger.info('  1. Set your API key:');
        logger.info(chalk.cyan('     export GEMINI_API_KEY=your-key'));
        logger.info('');
        logger.info('  2. Discover project conventions:');
        logger.info(chalk.cyan('     stargazer discover'));
        logger.info('');
        logger.info('  3. Review your code:');
        logger.info(chalk.cyan('     git add . && stargazer review'));
        logger.info('');
      } catch (error) {
        exitWithError(`Failed to create config file: ${error}`);
      }
    });
}

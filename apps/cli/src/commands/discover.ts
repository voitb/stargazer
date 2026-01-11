import { Command } from 'commander';
import { stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createGeminiClient } from '@stargazer/core/gemini/client';
import { discoverConventions } from '@stargazer/core/conventions/discovery';
import { saveConventions } from '@stargazer/core/conventions/cache';
import chalk from 'chalk';
import { exitWithError } from '../exit-codes.js';
import { logger } from '../logger.js';
import ora from 'ora';

export function createDiscoverCommand(): Command {
  const command = new Command('discover')
    .description('Discover coding conventions from current project')
    .option('-p, --path <directory>', 'Project directory to analyze', process.cwd())
    .option('--json', 'Output conventions as JSON')
    .option('--max-files <number>', 'Maximum files to analyze', '50')
    .action(async (options) => {
      const apiKey = process.env['GEMINI_API_KEY'];
      if (!apiKey) {
        exitWithError('GEMINI_API_KEY environment variable is required\nSet it with: export GEMINI_API_KEY=your-key');
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

      const maxFiles = parseInt(options.maxFiles, 10);

      if (isNaN(maxFiles) || maxFiles <= 0) {
        exitWithError('--max-files must be a positive integer (e.g., --max-files 10)');
      }

      if (maxFiles > 100) {
        exitWithError('--max-files cannot exceed 100 to prevent excessive API usage');
      }

      const spinner = ora('Discovering project conventions...').start();

      try {
        const client = createGeminiClient(apiKey);

        const result = await discoverConventions(client, {
          projectPath,
          maxFiles,
        });

        if (!result.ok) {
          spinner.fail('Discovery failed');
          exitWithError(result.error.message);
        }

        spinner.succeed('Conventions discovered');

        const conventions = result.data;

        const saveResult = await saveConventions(projectPath, conventions);
        if (!saveResult.ok) {
          logger.warn(`Could not save conventions: ${saveResult.error.message}`);
        }

        if (options.json) {
          logger.info(JSON.stringify(conventions, null, 2));
        } else {
          logger.info(chalk.green('\n✅ Conventions discovered!\n'));
          logger.info(chalk.bold('Summary:') + ' ' + conventions.summary);
          logger.info(chalk.bold('Language:') + ' ' + conventions.language);
          logger.info(chalk.bold('Discovered at:') + ' ' + conventions.discoveredAt);

          logger.info(chalk.bold('\nPatterns:'));
          const patterns = conventions.patterns;

          if (patterns.errorHandling) {
            logger.info(chalk.cyan('\n  Error Handling:') + ' ' + patterns.errorHandling.name);
            logger.info(chalk.gray(`    ${patterns.errorHandling.description}`));
          }
          if (patterns.naming) {
            logger.info(chalk.cyan('\n  Naming:') + ' ' + patterns.naming.name);
            logger.info(chalk.gray(`    ${patterns.naming.description}`));
          }
          if (patterns.testing) {
            logger.info(chalk.cyan('\n  Testing:') + ' ' + patterns.testing.name);
            logger.info(chalk.gray(`    ${patterns.testing.description}`));
          }
          if (patterns.imports) {
            logger.info(chalk.cyan('\n  Imports:') + ' ' + patterns.imports.name);
            logger.info(chalk.gray(`    ${patterns.imports.description}`));
          }

          logger.info(chalk.gray('\nConventions saved to .stargazer/conventions.json'));
        }

        // Command completed successfully - Commander handles exit
      } catch (error) {
        spinner.fail('Discovery failed');
        exitWithError(`Discovery failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    });

  return command;
}

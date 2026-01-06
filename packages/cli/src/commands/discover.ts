import { Command } from 'commander';
import { createGeminiClient } from '@stargazer/core/gemini/client';
import { discoverConventions } from '@stargazer/core/conventions/discovery';
import { saveConventions } from '@stargazer/core/conventions/cache';
import chalk from 'chalk';

export function createDiscoverCommand(): Command {
  const command = new Command('discover')
    .description('Discover coding conventions from current project')
    .option('--json', 'Output conventions as JSON')
    .option('--max-files <number>', 'Maximum files to analyze', '50')
    .action(async (options) => {
      const apiKey = process.env['GEMINI_API_KEY'];
      if (!apiKey) {
        console.error(chalk.red('Error: GEMINI_API_KEY environment variable is required'));
        process.exit(2);
      }

      const projectPath = process.cwd();
      const maxFiles = parseInt(options.maxFiles, 10);

      console.log(chalk.blue('🔍 Discovering conventions...'));
      console.log(chalk.gray(`   Analyzing up to ${maxFiles} files in ${projectPath}`));

      const client = createGeminiClient(apiKey);

      const result = await discoverConventions(client, {
        projectPath,
        maxFiles,
      });

      if (!result.ok) {
        console.error(chalk.red(`Error: ${result.error.message}`));
        process.exit(2);
      }

      const conventions = result.data;

      const saveResult = await saveConventions(projectPath, conventions);
      if (!saveResult.ok) {
        console.error(chalk.yellow(`Warning: Could not save conventions: ${saveResult.error.message}`));
      }

      if (options.json) {
        console.log(JSON.stringify(conventions, null, 2));
      } else {
        console.log(chalk.green('\n✅ Conventions discovered!\n'));
        console.log(chalk.bold('Summary:'), conventions.summary);
        console.log(chalk.bold('Language:'), conventions.language);
        console.log(chalk.bold('Discovered at:'), conventions.discoveredAt);

        console.log(chalk.bold('\nPatterns:'));
        const patterns = conventions.patterns;

        if (patterns.errorHandling) {
          console.log(chalk.cyan('\n  Error Handling:'), patterns.errorHandling.name);
          console.log(chalk.gray(`    ${patterns.errorHandling.description}`));
        }
        if (patterns.naming) {
          console.log(chalk.cyan('\n  Naming:'), patterns.naming.name);
          console.log(chalk.gray(`    ${patterns.naming.description}`));
        }
        if (patterns.testing) {
          console.log(chalk.cyan('\n  Testing:'), patterns.testing.name);
          console.log(chalk.gray(`    ${patterns.testing.description}`));
        }
        if (patterns.imports) {
          console.log(chalk.cyan('\n  Imports:'), patterns.imports.name);
          console.log(chalk.gray(`    ${patterns.imports.description}`));
        }

        console.log(chalk.gray('\nConventions saved to .stargazer/conventions.json'));
      }
    });

  return command;
}

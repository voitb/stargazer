import { Command } from 'commander';
import { writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import chalk from 'chalk';
import { EXIT_CODES } from '../exit-codes';

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

export const initCommand = new Command('init')
  .description('Initialize Stargazer configuration file')
  .option('--force', 'Overwrite existing config file')
  .action(async (options) => {
    const configPath = join(process.cwd(), 'stargazer.config.ts');

    if (!options.force) {
      try {
        await access(configPath);
        console.error(chalk.yellow('Config file already exists: stargazer.config.ts'));
        console.error(chalk.dim('Use --force to overwrite'));
        process.exit(EXIT_CODES.ISSUES_FOUND);
      } catch {
      }
    }

    try {
      await writeFile(configPath, CONFIG_TEMPLATE, 'utf-8');

      console.log(chalk.green('✓ Created stargazer.config.ts'));
      console.log('');
      console.log(chalk.bold('Next steps:'));
      console.log('');
      console.log('  1. Set your API key:');
      console.log(chalk.cyan('     export GEMINI_API_KEY=your-key'));
      console.log('');
      console.log('  2. Discover project conventions:');
      console.log(chalk.cyan('     stargazer discover'));
      console.log('');
      console.log('  3. Review your code:');
      console.log(chalk.cyan('     git add . && stargazer review'));
      console.log('');
    } catch (error) {
      console.error(chalk.red('Failed to create config file:'), error);
      process.exit(EXIT_CODES.ERROR);
    }
  });

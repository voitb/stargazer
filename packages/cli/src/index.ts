#!/usr/bin/env node
import { Command } from 'commander';
import { reviewCommand } from './commands/review';
import { createDiscoverCommand } from './commands/discover';
import { initCommand } from './commands/init';
import { setLogLevel } from './logger';
import { exitWithError } from './exit-codes';

const program = new Command();

program
  .name('stargazer')
  .description('AI-powered code review using Google Gemini')
  .version('0.1.0')
  .option('-q, --quiet', 'Suppress non-essential output')
  .option('-v, --verbose', 'Enable verbose output')
  .hook('preAction', (thisCommand) => {
    const opts = thisCommand.opts();
    if (opts['quiet'] && opts['verbose']) {
      exitWithError('Cannot use both --quiet and --verbose');
    }
    if (opts['quiet']) setLogLevel('quiet');
    else if (opts['verbose']) setLogLevel('verbose');
  })
  .addHelpText('after', `
Examples:
  $ stargazer init                      Initialize config file
  $ stargazer discover                  Analyze project conventions
  $ stargazer review                    Review staged changes
  $ stargazer review --unstaged         Review all uncommitted changes
  $ stargazer review -f json            Output as JSON for CI

Exit Codes:
  0  Success (no issues found)
  1  Issues found
  2  Error

Environment Variables:
  GEMINI_API_KEY    Google Gemini API key (required)
`);

program.addCommand(reviewCommand);
program.addCommand(createDiscoverCommand());
program.addCommand(initCommand);

program.parse();

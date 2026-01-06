#!/usr/bin/env node
import { Command } from 'commander';
import { reviewCommand } from './commands/review';
import { createDiscoverCommand } from './commands/discover';
import { initCommand } from './commands/init';

const program = new Command();

program
  .name('stargazer')
  .description('AI-powered code review using Google Gemini')
  .version('0.1.0')
  .addHelpText('after', `
Exit Codes:
  0  Success (no issues found)
  1  Issues found
  2  Error
`);

program.addCommand(reviewCommand);
program.addCommand(createDiscoverCommand());
program.addCommand(initCommand);

program.parse();

#!/usr/bin/env node
import { Command } from 'commander';
import { reviewCommand } from './commands/review';

const program = new Command();

program
  .name('stargazer')
  .description('AI-powered code review using Google Gemini')
  .version('0.1.0');

program.addCommand(reviewCommand);

program.parse();

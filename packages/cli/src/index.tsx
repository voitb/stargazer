#!/usr/bin/env node

import { Command } from 'commander';
import { reviewCommand } from './commands/review.js';
import { createDiscoverCommand } from './commands/discover.js';
import { logger } from './logger.js';

const program = new Command();

program
  .name('stargazer')
  .description('AI-powered code review with convention learning')
  .version('0.1.0')
  .option('--no-tui', 'Run in non-interactive CLI mode')
  .option('-q, --quiet', 'Suppress non-essential output')
  .option('-v, --verbose', 'Enable verbose output');

program.addCommand(reviewCommand);
program.addCommand(createDiscoverCommand());

function shouldLaunchTUI(): boolean {
  const args = process.argv.slice(2);
  const hasCommand = args.some((arg: string) => !arg.startsWith('-'));
  const hasNoTuiFlag = args.includes('--no-tui');
  const isOutputTTY = process.stdout?.isTTY === true;
  const isInputTTY = process.stdin?.isTTY === true;

  return isOutputTTY && isInputTTY && !hasCommand && !hasNoTuiFlag;
}

async function main() {
  if (shouldLaunchTUI()) {
    const { startTUI } = await import('./tui/index.js');
    await startTUI();
  } else {
    program.parse();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  logger.error(`Fatal error: ${message}`);
  logger.info('Tip: Try running with --no-tui flag if TUI is failing');
  process.exit(2);
});

import chalk from 'chalk';

export type LogLevel = 'quiet' | 'normal' | 'verbose';

let currentLevel: LogLevel = 'normal';

export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

export const logger = {
  info: (message: string) => {
    if (currentLevel !== 'quiet') {
      console.log(message);
    }
  },

  debug: (message: string) => {
    if (currentLevel === 'verbose') {
      console.log(chalk.dim(`[debug] ${message}`));
    }
  },

  warn: (message: string) => {
    console.warn(chalk.yellow(`Warning: ${message}`));
  },

  error: (message: string) => {
    console.error(chalk.red(`Error: ${message}`));
  },

  success: (message: string) => {
    if (currentLevel !== 'quiet') {
      console.log(chalk.green(message));
    }
  },
};

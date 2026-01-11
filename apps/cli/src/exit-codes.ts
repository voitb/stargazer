import { logger } from './logger.js';

export const EXIT_CODES = {
  SUCCESS: 0,
  ISSUES_FOUND: 1,
  ERROR: 2,
} as const;

export type ExitCode = (typeof EXIT_CODES)[keyof typeof EXIT_CODES];

export function exitWithResult(issuesCount: number): never {
  process.exit(issuesCount > 0 ? EXIT_CODES.ISSUES_FOUND : EXIT_CODES.SUCCESS);
}

export function exitWithError(message: string): never {
  logger.error(message);
  process.exit(EXIT_CODES.ERROR);
}

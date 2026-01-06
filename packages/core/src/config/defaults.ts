import type { ResolvedConfig } from './types';

export const DEFAULT_CONFIG: ResolvedConfig = {
  model: 'gemini-2.0-flash',
  minSeverity: 'low',
  maxIssues: 20,
  ignore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/.git/**',
    '**/coverage/**',
    '**/*.min.js',
  ],
  plugins: [],
};

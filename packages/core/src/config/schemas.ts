import * as z from 'zod';

export const SEVERITIES = ['critical', 'high', 'medium', 'low'] as const;
export const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-pro'] as const;

export const StargazerConfigSchema = z.object({
  /** Minimum severity to report */
  minSeverity: z.enum(SEVERITIES).optional().describe('Minimum severity level to report'),

  /** Maximum issues to report (1-100) */
  maxIssues: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe('Maximum number of issues to report (1-100)'),

  /** Gemini model to use */
  model: z.enum(MODELS).optional().describe('Gemini model to use for review'),

  /** Paths to ignore (glob patterns) */
  ignore: z.array(z.string()).optional().describe('Glob patterns for paths to ignore'),

  /** Plugins to apply */
  plugins: z.array(z.any()).optional().describe('Plugins to apply during review'),
});

export type StargazerConfigFromSchema = z.infer<typeof StargazerConfigSchema>;

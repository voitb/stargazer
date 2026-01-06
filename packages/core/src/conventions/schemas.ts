import * as z from 'zod';

export const ConventionPatternSchema = z.object({
  name: z.string().describe('Name of the convention (e.g., "Error Handling", "Naming")'),
  description: z.string().describe('Description of what this convention is and when to apply it'),
  examples: z.array(z.string()).describe('Code examples demonstrating this convention'),
}).describe('A coding convention pattern discovered from the codebase');

export const ProjectConventionsSchema = z.object({
  version: z.literal('1.0').describe('Schema version'),
  discoveredAt: z.string().describe('ISO datetime when discovered'),
  language: z.string().describe('Primary language (typescript, javascript, etc.)'),
  patterns: z.object({
    errorHandling: ConventionPatternSchema.optional().describe('Error handling patterns'),
    naming: ConventionPatternSchema.optional().describe('Naming conventions'),
    testing: ConventionPatternSchema.optional().describe('Testing patterns'),
    imports: ConventionPatternSchema.optional().describe('Import organization'),
  }).describe('Discovered convention patterns by category'),
  summary: z.string().describe('Human-readable summary of all conventions'),
}).describe('Complete set of discovered project conventions');

export type ProjectConventionsFromSchema = z.infer<typeof ProjectConventionsSchema>;

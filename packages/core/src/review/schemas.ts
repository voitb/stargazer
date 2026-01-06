import * as z from 'zod';
import { SEVERITIES, CATEGORIES, DECISIONS } from './types';
import type { Issue, ReviewResult } from './types';

export const SeveritySchema = z.enum(SEVERITIES).describe('Issue severity level');

export const CategorySchema = z.enum(CATEGORIES).describe('Issue category');

export const IssueSchema = z.object({
  file: z.string().describe('Relative path to the file'),
  line: z.number().int().min(1).describe('Line number'),
  severity: SeveritySchema,
  category: CategorySchema,
  message: z.string().describe('Clear description of the issue'),
  suggestion: z.string().optional().describe('Suggested fix'),
  confidence: z.number().min(0).max(1).describe('Confidence score 0-1'),
  conventionRef: z.string().optional().describe('Convention category this violates (errorHandling, naming, testing, imports)'),
}).describe('A single code review issue') satisfies z.ZodType<Issue>;

export const DecisionSchema = z.enum(DECISIONS).describe('Review decision');

export const ReviewResultSchema = z.object({
  issues: z.array(IssueSchema).describe('List of issues found'),
  summary: z.string().describe('Brief summary of the review'),
  decision: DecisionSchema,
}).describe('Complete code review result') satisfies z.ZodType<ReviewResult>;

export const ReviewResultJSONSchema = z.toJSONSchema(ReviewResultSchema, {
  target: 'openapi-3.0',
});

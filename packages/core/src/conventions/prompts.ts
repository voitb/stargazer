import type { FileContext } from './types';

export function buildDiscoveryPrompt(files: readonly FileContext[]): string {
  const fileList = files
    .map(f => `### File: ${f.path}\n\`\`\`typescript\n${f.content}\n\`\`\``)
    .join('\n\n');

  return `You are a code convention analyzer. Analyze the following source files and discover the coding conventions used in this project.

## Your Task
Identify patterns in these areas:
1. **Error Handling**: How errors are handled (Result types, try-catch, custom errors, etc.)
2. **Naming**: Conventions for variables, functions, files, types
3. **Testing**: Test file organization, naming patterns, assertion styles
4. **Imports**: Import organization, named vs default, grouping

## Guidelines
- Only identify conventions that are CONSISTENTLY used across multiple files
- Provide 1-3 concrete code examples for each convention you identify
- If a convention category is not clearly established, omit it
- Focus on patterns that would be useful for code review

## Source Files to Analyze

${fileList}

## Response Format
Return a JSON object matching the ProjectConventions schema with:
- version: "1.0"
- discoveredAt: current ISO datetime
- language: detected primary language
- patterns: object with discovered conventions (only include categories with clear patterns)
- summary: 2-3 sentence summary of the project's coding style`;
}

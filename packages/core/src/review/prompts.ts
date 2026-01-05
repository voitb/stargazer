/**
 * Builds the prompt sent to Gemini for code review.
 * Takes a git diff string and wraps it with instructions.
 *
 * @param diff - The git diff content to review
 * @returns The complete prompt string for Gemini
 */
export function buildReviewPrompt(diff: string): string {
  return `You are a senior code reviewer. Review the following git diff and identify issues.

Focus on:
- Bugs and logic errors
- Security vulnerabilities
- Code style and conventions
- Performance issues

Be specific: include file path, line number, and clear explanation.
Only report real issues with high confidence.

Git Diff:
\`\`\`diff
${diff}
\`\`\`

Respond with your structured review.`;
}

/**
 * Manual test script: Get git diff and run AI review
 *
 * Usage:
 *   cd packages/core
 *   npx tsx src/test-review.ts
 *   npx tsx src/test-review.ts --unstaged   # for unstaged changes
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ES module equivalent of __dirname
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env from monorepo root
config({ path: resolve(__dirname, '../../../.env') });

import { getDiff } from './context/git';
import { createGeminiClient } from './gemini/client';
import { ReviewResultSchema } from './review/schemas';

async function main() {
  const staged = !process.argv.includes('--unstaged');

  console.log(`\n📋 Getting ${staged ? 'staged' : 'unstaged'} diff...\n`);

  // Step 1: Get the diff
  const diffResult = await getDiff(staged);

  if (!diffResult.ok) {
    console.error('❌ Failed to get diff:', diffResult.error);
    process.exit(1);
  }

  const diff = diffResult.data;

  if (!diff.trim()) {
    console.log(`ℹ️  No ${staged ? 'staged' : 'unstaged'} changes found.`);
    console.log(`   Try: git add <file>  (to stage changes)`);
    console.log(`   Or:  npx tsx src/test-review.ts --unstaged`);
    process.exit(0);
  }

  console.log('📝 Diff preview (first 500 chars):');
  console.log('─'.repeat(50));
  console.log(diff.slice(0, 500));
  if (diff.length > 500) console.log(`... (${diff.length - 500} more chars)`);
  console.log('─'.repeat(50));

  // Step 2: Send to Gemini for review
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env');
    process.exit(1);
  }

  console.log('\n🤖 Sending to Gemini for review...\n');

  const client = createGeminiClient(apiKey);

  const prompt = `You are a senior code reviewer. Review this git diff and identify any issues.

Be thorough but fair. Focus on:
- Bugs and logic errors
- Security vulnerabilities
- Code style and conventions
- Performance issues

Git diff:
\`\`\`diff
${diff}
\`\`\`

Provide a structured review with specific issues found.`;

  const reviewResult = await client.generate(prompt, ReviewResultSchema);

  if (!reviewResult.ok) {
    console.error('❌ Review failed:', reviewResult.error);
    process.exit(1);
  }

  const review = reviewResult.data;

  // Step 3: Display results
  console.log('═'.repeat(50));
  console.log('📊 REVIEW RESULT');
  console.log('═'.repeat(50));

  console.log(`\n🎯 Decision: ${review.decision.toUpperCase()}`);
  console.log(`\n📝 Summary: ${review.summary}`);

  if (review.issues.length === 0) {
    console.log('\n✅ No issues found!');
  } else {
    console.log(`\n⚠️  Found ${review.issues.length} issue(s):\n`);

    for (const issue of review.issues) {
      const severityEmoji = {
        critical: '🔴',
        high: '🟠',
        medium: '🟡',
        low: '🟢',
      }[issue.severity];

      console.log(`${severityEmoji} [${issue.severity.toUpperCase()}] ${issue.file}:${issue.line}`);
      console.log(`   Category: ${issue.category}`);
      console.log(`   Message: ${issue.message}`);
      if (issue.suggestion) {
        console.log(`   Suggestion: ${issue.suggestion}`);
      }
      console.log(`   Confidence: ${(issue.confidence * 100).toFixed(0)}%`);
      console.log('');
    }
  }

  console.log('═'.repeat(50));
}

main().catch(console.error);

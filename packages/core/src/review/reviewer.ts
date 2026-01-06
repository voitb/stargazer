import type { Result } from "../shared/result";
import type { GeminiClient } from "../gemini/types";
import type { ReviewResult, ReviewOptions } from "./types";
import { ReviewResultSchema } from "./schemas";
import { buildReviewPrompt } from "./prompts";
import { getDiff } from "../context/git";
import { err, ok } from "../shared/result";
import { loadConventions } from "../conventions/cache";

const MAX_DIFF_SIZE = 100_000; // characters

export async function reviewDiff(
  client: GeminiClient,
  options: ReviewOptions = {},
): Promise<Result<ReviewResult>> {
  const { staged = true, diff: providedDiff, projectPath } = options;
  const warnings: string[] = [];

  let diff: string;

  if (providedDiff) {
    diff = providedDiff;
  } else {
    const diffResult = await getDiff(staged);

    if (!diffResult.ok) {
      return diffResult;
    }

    diff = diffResult.data;
  }

  // Validate diff size
  if (diff.length > MAX_DIFF_SIZE) {
    return err({
      code: 'BAD_REQUEST',
      message: `Diff too large (${diff.length} chars). Maximum is ${MAX_DIFF_SIZE} chars. Consider reviewing smaller changesets.`,
    });
  }

  if (!diff.trim()) {
    return err({
      code: "EMPTY_RESPONSE",
      message: "No changes to review",
    });
  }

  let conventions = null;
  if (projectPath) {
    const conventionsResult = await loadConventions(projectPath);
    if (conventionsResult.ok) {
      conventions = conventionsResult.data;
    } else {
      warnings.push(`Could not load conventions: ${conventionsResult.error.message}`);
      console.warn(`[Stargazer] ${warnings[warnings.length - 1]}`);
    }
  }

  const prompt = buildReviewPrompt(diff, conventions);

  const result = await client.generate(prompt, ReviewResultSchema);

  if (!result.ok) {
    return result;
  }

  return ok({
    ...result.data,
    warnings: warnings.length > 0 ? warnings : undefined,
  });
}

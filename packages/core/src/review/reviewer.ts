import type { Result } from "../shared/result";
import type { GeminiClient } from "../gemini/types";
import type { ReviewResult, ReviewOptions } from "./types";
import { ReviewResultSchema } from "./schemas";
import { buildReviewPrompt, buildReviewPromptWithConventions } from "./prompts";
import { getDiff } from "../context/git";
import { err } from "../shared/result";
import { loadConventions } from "../conventions/cache";

export async function reviewDiff(
  client: GeminiClient,
  options: ReviewOptions = {},
): Promise<Result<ReviewResult>> {
  const { staged = true, diff: providedDiff, projectPath } = options;

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
    }
  }

  const prompt = conventions
    ? buildReviewPromptWithConventions(diff, conventions)
    : buildReviewPrompt(diff);

  return client.generate(prompt, ReviewResultSchema);
}

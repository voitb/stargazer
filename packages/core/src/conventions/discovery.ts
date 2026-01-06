import * as z from 'zod';
import type { GeminiClient } from '../gemini/types';
import { ok, err, type Result } from '../shared/result';
import type { ApiError } from '../shared/error-codes';
import type { ProjectConventions } from './types';
import { ProjectConventionsSchema } from './schemas';
import { readProjectFiles } from './file-reader';
import { buildDiscoveryPrompt } from './prompts';

export interface DiscoverOptions {
  readonly projectPath: string;
  readonly maxFiles?: number;
}

export async function discoverConventions(
  client: GeminiClient,
  options: DiscoverOptions
): Promise<Result<ProjectConventions>> {
  const { projectPath, maxFiles = 50 } = options;

  const filesResult = await readProjectFiles(projectPath, maxFiles);
  if (!filesResult.ok) {
    return filesResult;
  }

  const files = filesResult.data;
  if (files.length === 0) {
    return err({
      code: 'FILE_NOT_FOUND',
      message: 'No TypeScript/JavaScript files found in the project',
    });
  }

  const prompt = buildDiscoveryPrompt(files);

  const response = await client.generate(prompt, ProjectConventionsSchema);
  if (!response.ok) {
    return response;
  }

  return ok(response.data);
}

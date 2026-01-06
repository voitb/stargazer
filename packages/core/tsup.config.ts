import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/context/git.ts',
    'src/gemini/client.ts',
    'src/gemini/models.ts',
    'src/gemini/types.ts',
    'src/review/prompts.ts',
    'src/review/reviewer.ts',
    'src/review/schemas.ts',
    'src/shared/error-codes.ts',
    'src/shared/result.ts',
    'src/conventions/types.ts',
    'src/conventions/schemas.ts',
    'src/conventions/file-reader.ts',
    'src/conventions/prompts.ts',
    'src/conventions/discovery.ts',
    'src/conventions/cache.ts',
  ],
  format: ['esm'],
  dts: true,
  treeshake: true,
  clean: true,
});

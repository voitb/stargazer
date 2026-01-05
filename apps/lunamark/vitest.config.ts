import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [react(), tsconfigPaths()],
	test: {
		environment: "jsdom",
		include: ["**/*.test.{ts,tsx}"],
		exclude: ["**/node_modules/**", "**/dist/**"],
		globals: true,
		setupFiles: ["./vitest.setup.ts"],
		clearMocks: true,
		restoreMocks: true,
		unstubGlobals: true,
		unstubEnvs: true,
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
			include: ["src/**/*.{ts,tsx}", "packages/**/*.{ts,tsx}"],
			exclude: ["**/*.test.{ts,tsx}", "**/*.d.ts"],
		},
	},
});

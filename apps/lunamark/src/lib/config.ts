import * as fs from "node:fs";
import * as path from "node:path";
import { z } from "zod";
import { ColumnConfigSchema, DEFAULT_COLUMNS } from "@/schemas/task";

export const LunamarkUserConfigSchema = z.object({
	tasksDir: z.string().default("./tasks"),

	watch: z.boolean().default(true),

	columns: z.array(ColumnConfigSchema).optional(),
});

export type LunamarkUserConfig = z.infer<typeof LunamarkUserConfigSchema>;

export const LunamarkConfigSchema = LunamarkUserConfigSchema.extend({
	configDir: z.string(),
});

export type LunamarkConfig = z.infer<typeof LunamarkConfigSchema>;

export function defineConfig(
	config: Partial<LunamarkUserConfig>,
): LunamarkUserConfig {
	return LunamarkUserConfigSchema.parse(config);
}

const CONFIG_FILES = [
	"lunamark.config.ts",
	"lunamark.config.js",
	"lunamark.config.mjs",
];

export function findConfigFile(
	startDir: string = process.cwd(),
	maxDepth = 10,
): string | null {
	let currentDir = startDir;
	let depth = 0;

	while (depth < maxDepth) {
		for (const configFile of CONFIG_FILES) {
			const configPath = path.join(currentDir, configFile);
			if (fs.existsSync(configPath)) {
				return configPath;
			}
		}

		const parentDir = path.dirname(currentDir);
		if (parentDir === currentDir) {
			break;
		}

		currentDir = parentDir;
		depth++;
	}

	return null;
}

async function loadConfigFile(configPath: string): Promise<LunamarkUserConfig> {
	try {
		const module = await import(configPath);
		const config = module.default || module;

		return LunamarkUserConfigSchema.parse(config);
	} catch (error) {
		console.warn(`[Lunamark] Failed to load config from ${configPath}:`, error);
		return LunamarkUserConfigSchema.parse({});
	}
}

export async function resolveConfig(
	overrides?: Partial<LunamarkUserConfig>,
): Promise<LunamarkConfig> {
	const configPath = findConfigFile();
	const configDir = configPath ? path.dirname(configPath) : process.cwd();

	let fileConfig: LunamarkUserConfig = LunamarkUserConfigSchema.parse({});
	if (configPath) {
		fileConfig = await loadConfigFile(configPath);
	}

	const envTasksDir = process.env.LUNAMARK_TASKS_DIR;
	const mergedConfig: LunamarkUserConfig = {
		...fileConfig,
		...(envTasksDir ? { tasksDir: envTasksDir } : {}),
		...overrides,
	};

	return LunamarkConfigSchema.parse({
		...mergedConfig,
		configDir,
	});
}

export function resolveConfigSync(
	overrides?: Partial<LunamarkUserConfig>,
): LunamarkConfig {
	const configPath = findConfigFile();
	const configDir = configPath ? path.dirname(configPath) : process.cwd();
	const envTasksDir = process.env.LUNAMARK_TASKS_DIR;

	const config: LunamarkUserConfig = {
		...LunamarkUserConfigSchema.parse({}),
		...(envTasksDir ? { tasksDir: envTasksDir } : {}),
		...overrides,
	};

	return LunamarkConfigSchema.parse({
		...config,
		configDir,
	});
}

export function getTasksDir(config: LunamarkConfig): string {
	const { tasksDir, configDir } = config;

	if (path.isAbsolute(tasksDir)) {
		return tasksDir;
	}

	return path.resolve(configDir, tasksDir);
}

export function getColumns(config: LunamarkConfig) {
	return config.columns || DEFAULT_COLUMNS;
}

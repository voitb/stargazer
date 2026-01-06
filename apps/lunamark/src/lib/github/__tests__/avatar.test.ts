import { describe, expect, it } from "vitest";
import { getGitHubAvatarUrl } from "../avatar";

describe("getGitHubAvatarUrl", () => {
	it("generates correct GitHub avatar URL", () => {
		expect(getGitHubAvatarUrl("voitb")).toBe("https://github.com/voitb.png");
	});

	it("handles usernames with hyphens", () => {
		expect(getGitHubAvatarUrl("user-name")).toBe(
			"https://github.com/user-name.png",
		);
	});

	it("handles usernames with numbers", () => {
		expect(getGitHubAvatarUrl("user123")).toBe(
			"https://github.com/user123.png",
		);
	});

	it("handles empty string", () => {
		expect(getGitHubAvatarUrl("")).toBe("https://github.com/.png");
	});
});

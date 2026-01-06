/**
 * Generates a GitHub avatar URL from a username.
 * Pattern: https://github.com/{username}.png
 */
export function getGitHubAvatarUrl(username: string): string {
	return `https://github.com/${username}.png`;
}

import { describe, expect, it } from "vitest";
import {
	isValidPriority,
	validateRouteSearch,
	VALID_PRIORITIES,
} from "./validate-route-search";

describe("isValidPriority", () => {
	it("returns true for valid priorities", () => {
		for (const priority of VALID_PRIORITIES) {
			expect(isValidPriority(priority)).toBe(true);
		}
	});

	it("returns false for invalid values", () => {
		expect(isValidPriority("urgent")).toBe(false);
		expect(isValidPriority(123)).toBe(false);
		expect(isValidPriority(null)).toBe(false);
	});
});

describe("validateRouteSearch", () => {
	it("extracts valid assignee string", () => {
		const result = validateRouteSearch({ assignee: "john" });
		expect(result.assignee).toBe("john");
	});

	it("returns undefined for invalid assignee", () => {
		expect(validateRouteSearch({ assignee: 123 }).assignee).toBeUndefined();
		expect(validateRouteSearch({}).assignee).toBeUndefined();
	});

	it("extracts valid priority", () => {
		const result = validateRouteSearch({ priority: "high" });
		expect(result.priority).toBe("high");
	});

	it("returns undefined for invalid priority", () => {
		expect(validateRouteSearch({ priority: "urgent" }).priority).toBeUndefined();
	});

	it("filters labels array to strings only", () => {
		const result = validateRouteSearch({ labels: ["bug", 123, "feature", null] });
		expect(result.labels).toEqual(["bug", "feature"]);
	});

	it("returns undefined for non-array labels", () => {
		expect(validateRouteSearch({ labels: "bug" }).labels).toBeUndefined();
		expect(validateRouteSearch({}).labels).toBeUndefined();
	});

	it("validates complete search params", () => {
		const result = validateRouteSearch({
			assignee: "jane",
			priority: "critical",
			labels: ["urgent", "frontend"],
		});
		expect(result).toEqual({
			assignee: "jane",
			priority: "critical",
			labels: ["urgent", "frontend"],
		});
	});
});

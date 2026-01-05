import "@testing-library/jest-dom/vitest";
import "vitest-axe/extend-expect";
import * as matchers from "vitest-axe/matchers";
import { expect, afterEach, beforeEach } from "vitest";

expect.extend(matchers);

// Floating UI requires offsetParent for positioning calculations in jsdom.
// jsdom doesn't implement offsetParent, so we mock it globally for all tests.
// This enables proper testing of Dropdown, Popover, Tooltip, and other
// Floating UI-based components in the @ui package.
let originalOffsetParent: PropertyDescriptor | undefined;

beforeEach(() => {
	originalOffsetParent = Object.getOwnPropertyDescriptor(
		HTMLElement.prototype,
		"offsetParent",
	);
	Object.defineProperty(HTMLElement.prototype, "offsetParent", {
		get() {
			return document.body;
		},
		configurable: true,
	});
});

afterEach(() => {
	if (originalOffsetParent) {
		Object.defineProperty(HTMLElement.prototype, "offsetParent", originalOffsetParent);
	}
});

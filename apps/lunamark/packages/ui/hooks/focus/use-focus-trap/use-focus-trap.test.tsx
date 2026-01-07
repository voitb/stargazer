import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useRef } from "react";
import { useFocusTrap } from "./use-focus-trap";

function TestComponent({
	isActive,
	children,
}: { isActive: boolean; children: React.ReactNode }) {
	const ref = useRef<HTMLDivElement>(null);
	useFocusTrap(ref, isActive);
	return (
		<div ref={ref} data-testid="trap-container">
			{children}
		</div>
	);
}

describe("useFocusTrap", () => {
	let sibling: HTMLDivElement;
	let originalOffsetParent: PropertyDescriptor | undefined;

	beforeEach(() => {
		sibling = document.createElement("div");
		sibling.innerHTML = '<button data-testid="outside-button">Outside</button>';
		document.body.appendChild(sibling);

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
		document.body.removeChild(sibling);
		document.body.innerHTML = "";
		if (originalOffsetParent)
			Object.defineProperty(
				HTMLElement.prototype,
				"offsetParent",
				originalOffsetParent,
			);
	});

	it("sets inert on siblings when active, removes when deactivated", () => {
		const { rerender } = render(
			<TestComponent isActive={true}>
				<button>First</button>
			</TestComponent>,
		);
		expect(sibling.getAttribute("inert")).toBe("");

		rerender(
			<TestComponent isActive={false}>
				<button>First</button>
			</TestComponent>,
		);
		expect(sibling.getAttribute("inert")).toBeNull();
	});

	it("focuses first focusable element when activated", () => {
		const focusCalls: Element[] = [];
		const originalFocus = HTMLElement.prototype.focus;
		vi.spyOn(HTMLElement.prototype, "focus").mockImplementation(function (
			this: HTMLElement,
		) {
			focusCalls.push(this);
			return originalFocus.call(this);
		});

		render(
			<TestComponent isActive={true}>
				<button data-testid="first">First</button>
				<button>Second</button>
			</TestComponent>,
		);
		expect(focusCalls).toContain(screen.getByTestId("first"));
		vi.restoreAllMocks();
	});

	it("wraps focus at boundaries", () => {
		const focusCalls: Element[] = [];
		vi.spyOn(HTMLElement.prototype, "focus").mockImplementation(function (
			this: HTMLElement,
		) {
			focusCalls.push(this);
			Object.defineProperty(document, "activeElement", {
				value: this,
				writable: true,
				configurable: true,
			});
		});

		render(
			<TestComponent isActive={true}>
				<button data-testid="first">First</button>
				<button data-testid="last">Last</button>
			</TestComponent>,
		);

		const container = screen.getByTestId("trap-container");
		const first = screen.getByTestId("first");
		const last = screen.getByTestId("last");

		Object.defineProperty(document, "activeElement", {
			value: last,
			writable: true,
			configurable: true,
		});
		focusCalls.length = 0;
		fireEvent.keyDown(container, { key: "Tab" });
		expect(focusCalls).toContain(first);

		Object.defineProperty(document, "activeElement", {
			value: first,
			writable: true,
			configurable: true,
		});
		focusCalls.length = 0;
		fireEvent.keyDown(container, { key: "Tab", shiftKey: true });
		expect(focusCalls).toContain(last);

		vi.restoreAllMocks();
	});

	it("handles null ref gracefully", () => {
		function NullRefComponent() {
			const ref = useRef<HTMLDivElement>(null);
			useFocusTrap(ref, true);
			return null;
		}
		expect(() => render(<NullRefComponent />)).not.toThrow();
	});

	it("handles container with no focusable elements", () => {
		expect(() =>
			render(
				<TestComponent isActive={true}>
					<div>No focusable</div>
				</TestComponent>,
			),
		).not.toThrow();
	});
});

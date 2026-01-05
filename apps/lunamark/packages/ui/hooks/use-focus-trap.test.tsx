import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useRef, useState } from "react";
import { useFocusTrap } from "./use-focus-trap";

function setup(jsx: React.ReactElement) {
	return {
		user: userEvent.setup(),
		...render(jsx),
	};
}

function TestComponent({
	isActive,
	children,
}: {
	isActive: boolean;
	children: React.ReactNode;
}) {
	const ref = useRef<HTMLDivElement>(null);
	useFocusTrap(ref, isActive);

	return (
		<div ref={ref} data-testid="trap-container">
			{children}
		</div>
	);
}

function ToggleableTestComponent({
	initialActive = false,
}: {
	initialActive?: boolean;
}) {
	const [isActive, setIsActive] = useState(initialActive);
	const ref = useRef<HTMLDivElement>(null);
	useFocusTrap(ref, isActive);

	return (
		<>
			<button data-testid="toggle" onClick={() => setIsActive(!isActive)}>
				Toggle
			</button>
			<div ref={ref} data-testid="trap-container">
				<button data-testid="first-button">First</button>
				<input data-testid="input" />
				<button data-testid="last-button">Last</button>
			</div>
		</>
	);
}

describe("useFocusTrap", () => {
	let sibling: HTMLDivElement;

	beforeEach(() => {
		sibling = document.createElement("div");
		sibling.setAttribute("data-testid", "sibling");
		sibling.innerHTML = '<button data-testid="outside-button">Outside</button>';
		document.body.appendChild(sibling);
	});

	afterEach(() => {
		document.body.removeChild(sibling);
		document.body.innerHTML = "";
	});

	describe("inert attribute behavior", () => {
		it("sets inert on sibling elements when active", () => {
			render(
				<TestComponent isActive={true}>
					<button data-testid="first-button">First</button>
				</TestComponent>,
			);

			expect(sibling.getAttribute("inert")).toBe("");
		});

		it("does not set inert when inactive", () => {
			render(
				<TestComponent isActive={false}>
					<button data-testid="first-button">First</button>
				</TestComponent>,
			);

			expect(sibling.getAttribute("inert")).toBeNull();
		});

		it("removes inert on deactivation", () => {
			const { rerender } = render(
				<TestComponent isActive={true}>
					<button data-testid="first-button">First</button>
				</TestComponent>,
			);

			expect(sibling.getAttribute("inert")).toBe("");

			rerender(
				<TestComponent isActive={false}>
					<button data-testid="first-button">First</button>
				</TestComponent>,
			);

			expect(sibling.getAttribute("inert")).toBeNull();
		});

		it("toggles inert on dynamic state change", async () => {
			const { user } = setup(<ToggleableTestComponent initialActive={false} />);

			expect(sibling.getAttribute("inert")).toBeNull();

			await user.click(screen.getByTestId("toggle"));
			expect(sibling.getAttribute("inert")).toBe("");

			await user.click(screen.getByTestId("toggle"));
			expect(sibling.getAttribute("inert")).toBeNull();
		});
	});

	describe("focus behavior", () => {
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
				Object.defineProperty(
					HTMLElement.prototype,
					"offsetParent",
					originalOffsetParent,
				);
			}
		});

		it("calls focus on first focusable element when activated", () => {
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
					<button data-testid="first-button">First</button>
					<button data-testid="second-button">Second</button>
				</TestComponent>,
			);

			const firstButton = screen.getByTestId("first-button");
			expect(focusCalls).toContain(firstButton);

			vi.restoreAllMocks();
		});

		it("wraps focus from last to first on Tab at boundary", () => {
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
			vi.restoreAllMocks();
		});

		it("wraps focus from first to last on Shift+Tab at boundary", () => {
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
				value: first,
				writable: true,
				configurable: true,
			});

			focusCalls.length = 0;
			fireEvent.keyDown(container, { key: "Tab", shiftKey: true });

			expect(focusCalls).toContain(last);
			vi.restoreAllMocks();
		});

		it("calls focus on previously focused element when deactivated", () => {
			const focusCalls: Element[] = [];
			vi.spyOn(HTMLElement.prototype, "focus").mockImplementation(function (
				this: HTMLElement,
			) {
				focusCalls.push(this);
			});

			const outsideButton = document.createElement("button");
			outsideButton.setAttribute("data-testid", "outside-focus");
			document.body.insertBefore(outsideButton, document.body.firstChild);

			Object.defineProperty(document, "activeElement", {
				value: outsideButton,
				writable: true,
				configurable: true,
			});

			const { rerender } = render(
				<TestComponent isActive={true}>
					<button data-testid="inside">Inside</button>
				</TestComponent>,
			);

			focusCalls.length = 0;

			rerender(
				<TestComponent isActive={false}>
					<button data-testid="inside">Inside</button>
				</TestComponent>,
			);

			expect(focusCalls).toContain(outsideButton);

			vi.restoreAllMocks();
			document.body.removeChild(outsideButton);
		});
	});

	describe("keyboard handling", () => {
		it("adds keydown listener to container when active", () => {
			const addEventListenerSpy = vi.spyOn(HTMLDivElement.prototype, "addEventListener");

			render(
				<TestComponent isActive={true}>
					<button data-testid="first-button">First</button>
				</TestComponent>,
			);

			expect(addEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
			addEventListenerSpy.mockRestore();
		});

		it("removes keydown listener on cleanup", () => {
			const removeEventListenerSpy = vi.spyOn(
				HTMLDivElement.prototype,
				"removeEventListener",
			);

			const { unmount } = render(
				<TestComponent isActive={true}>
					<button data-testid="first-button">First</button>
				</TestComponent>,
			);

			unmount();

			expect(removeEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
			removeEventListenerSpy.mockRestore();
		});
	});

	describe("edge cases", () => {
		it("handles container with no focusable elements gracefully", () => {
			expect(() => {
				render(
					<TestComponent isActive={true}>
						<div>No focusable elements here</div>
					</TestComponent>,
				);
			}).not.toThrow();
		});

		it("handles null ref gracefully", () => {
			function NullRefComponent() {
				const ref = useRef<HTMLDivElement>(null);
				useFocusTrap(ref, true);
				return null;
			}

			expect(() => {
				render(<NullRefComponent />);
			}).not.toThrow();
		});

		it("handles rapid activation/deactivation", () => {
			const { rerender } = render(
				<TestComponent isActive={false}>
					<button data-testid="first-button">First</button>
				</TestComponent>,
			);

			rerender(
				<TestComponent isActive={true}>
					<button data-testid="first-button">First</button>
				</TestComponent>,
			);

			rerender(
				<TestComponent isActive={false}>
					<button data-testid="first-button">First</button>
				</TestComponent>,
			);

			rerender(
				<TestComponent isActive={true}>
					<button data-testid="first-button">First</button>
				</TestComponent>,
			);

			expect(sibling.getAttribute("inert")).toBe("");
		});
	});

	describe("WCAG compliance", () => {
		it("sibling isolation prevents screen reader access outside trap", () => {
			render(
				<TestComponent isActive={true}>
					<button data-testid="first-button">First</button>
				</TestComponent>,
			);

			expect(sibling.getAttribute("inert")).toBe("");
		});
	});
});

import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useRef, useState } from "react";
import { useFocusTrap } from "./use-focus-trap";

function setup(jsx: React.ReactElement) {
	return { user: userEvent.setup(), ...render(jsx) };
}

function TestComponent({ isActive, children }: { isActive: boolean; children: React.ReactNode }) {
	const ref = useRef<HTMLDivElement>(null);
	useFocusTrap(ref, isActive);
	return <div ref={ref} data-testid="trap-container">{children}</div>;
}

function ToggleableTestComponent({ initialActive = false }: { initialActive?: boolean }) {
	const [isActive, setIsActive] = useState(initialActive);
	const ref = useRef<HTMLDivElement>(null);
	useFocusTrap(ref, isActive);

	return (
		<>
			<button data-testid="toggle" onClick={() => setIsActive(!isActive)}>Toggle</button>
			<div ref={ref} data-testid="trap-container">
				<button data-testid="first-button">First</button>
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

	describe("inert attribute", () => {
		it("sets inert on siblings when active, removes on deactivation", () => {
			const { rerender } = render(<TestComponent isActive={true}><button>First</button></TestComponent>);
			expect(sibling.getAttribute("inert")).toBe("");

			rerender(<TestComponent isActive={false}><button>First</button></TestComponent>);
			expect(sibling.getAttribute("inert")).toBeNull();
		});

		it("does not set inert when inactive", () => {
			render(<TestComponent isActive={false}><button>First</button></TestComponent>);
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

	describe("focus trapping", () => {
		let originalOffsetParent: PropertyDescriptor | undefined;

		beforeEach(() => {
			originalOffsetParent = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetParent");
			Object.defineProperty(HTMLElement.prototype, "offsetParent", { get() { return document.body; }, configurable: true });
		});

		afterEach(() => {
			if (originalOffsetParent) Object.defineProperty(HTMLElement.prototype, "offsetParent", originalOffsetParent);
		});

		it("focuses first focusable element when activated", () => {
			const focusCalls: Element[] = [];
			const originalFocus = HTMLElement.prototype.focus;
			vi.spyOn(HTMLElement.prototype, "focus").mockImplementation(function (this: HTMLElement) {
				focusCalls.push(this);
				return originalFocus.call(this);
			});

			render(<TestComponent isActive={true}><button data-testid="first">First</button><button>Second</button></TestComponent>);
			expect(focusCalls).toContain(screen.getByTestId("first"));
			vi.restoreAllMocks();
		});

		it("wraps focus at boundaries", () => {
			const focusCalls: Element[] = [];
			vi.spyOn(HTMLElement.prototype, "focus").mockImplementation(function (this: HTMLElement) {
				focusCalls.push(this);
				Object.defineProperty(document, "activeElement", { value: this, writable: true, configurable: true });
			});

			render(<TestComponent isActive={true}><button data-testid="first">First</button><button data-testid="last">Last</button></TestComponent>);
			const container = screen.getByTestId("trap-container");
			const first = screen.getByTestId("first");
			const last = screen.getByTestId("last");

			Object.defineProperty(document, "activeElement", { value: last, writable: true, configurable: true });
			focusCalls.length = 0;
			fireEvent.keyDown(container, { key: "Tab" });
			expect(focusCalls).toContain(first);

			Object.defineProperty(document, "activeElement", { value: first, writable: true, configurable: true });
			focusCalls.length = 0;
			fireEvent.keyDown(container, { key: "Tab", shiftKey: true });
			expect(focusCalls).toContain(last);
			vi.restoreAllMocks();
		});
	});

	describe("cleanup", () => {
		it("removes keydown listener on unmount", () => {
			const spy = vi.spyOn(HTMLDivElement.prototype, "removeEventListener");
			const { unmount } = render(<TestComponent isActive={true}><button>First</button></TestComponent>);
			unmount();
			expect(spy).toHaveBeenCalledWith("keydown", expect.any(Function));
			spy.mockRestore();
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
			expect(() => render(<TestComponent isActive={true}><div>No focusable</div></TestComponent>)).not.toThrow();
		});
	});
});

import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./index";

describe("Card", () => {
	it("renders as div with expected data-slot", () => {
		render(<Card data-testid="card" />);
		const card = screen.getByTestId("card");
		expect(card.tagName).toBe("DIV");
		expect(card).toHaveAttribute("data-slot", "card");
	});

	it("forwards ref", () => {
		const ref = createRef<HTMLDivElement>();
		render(<Card ref={ref} className="custom-class" data-testid="card" />);
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
	});

	it("spreads additional props", () => {
		render(<Card data-testid="card" aria-label="Test card" />);
		expect(screen.getByTestId("card")).toHaveAttribute("aria-label", "Test card");
	});
});

describe("Card Sub-components", () => {
	it.each([
		{ Component: CardHeader, slot: "card-header", tag: "DIV" },
		{ Component: CardTitle, slot: "card-title", tag: "H3" },
		{ Component: CardDescription, slot: "card-description", tag: "P" },
		{ Component: CardContent, slot: "card-content", tag: "DIV" },
		{ Component: CardFooter, slot: "card-footer", tag: "DIV" },
	])("$slot renders with correct structure and forwards ref", ({ Component, slot, tag }) => {
		const ref = createRef<HTMLDivElement>();
		render(
			<Component ref={ref} data-testid="element" className="custom">
				Content
			</Component>,
		);

		const element = screen.getByTestId("element");
		expect(element.tagName).toBe(tag);
		expect(element).toHaveAttribute("data-slot", slot);
		expect(ref.current).toBeInstanceOf(HTMLElement);
	});
});

describe("Card Composition", () => {
	it("renders all sub-components together with proper nesting", () => {
		render(
			<Card data-testid="card">
				<CardHeader>
					<CardTitle>Test Title</CardTitle>
					<CardDescription>Test description</CardDescription>
				</CardHeader>
				<CardContent>Test content</CardContent>
				<CardFooter>Test footer</CardFooter>
			</Card>,
		);

		expect(screen.getByTestId("card")).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Test Title");
		expect(screen.getByText("Test description")).toBeInTheDocument();
		expect(screen.getByText("Test content")).toBeInTheDocument();
		expect(screen.getByText("Test footer")).toBeInTheDocument();
	});
});

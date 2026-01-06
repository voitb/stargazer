import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DropIndicator } from "./drop-indicator";

describe("DropIndicator", () => {
  it("renders when isVisible is true", () => {
    const { container } = render(<DropIndicator isVisible={true} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("returns null when isVisible is false", () => {
    const { container } = render(<DropIndicator isVisible={false} />);
    expect(container.firstChild).toBeNull();
  });
});

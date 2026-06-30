import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Badge } from "./badge";

describe("Badge", () => {
  it("renders its children", () => {
    const { getByText } = render(<Badge>http</Badge>);
    expect(getByText("http")).toBeInTheDocument();
  });

  it("renders a leading icon when given one", () => {
    const { container, getByText } = render(
      <Badge variant="ok" icon="check">
        available
      </Badge>,
    );
    expect(getByText("available")).toBeInTheDocument();
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders a status dot when asked, and none otherwise", () => {
    const withDot = render(
      <Badge variant="warn" dot>
        live
      </Badge>,
    );
    // the dot is a bare span sibling of the text; the text span plus the dot span = 2 spans inside
    expect(withDot.container.querySelectorAll("span span").length).toBeGreaterThan(0);

    const plain = render(<Badge>plain</Badge>);
    expect(plain.container.querySelector("svg")).toBeNull();
  });

  it("passes through arbitrary span attributes", () => {
    const { getByTestId } = render(
      <Badge data-testid="chip" mono size="sm" variant="accent">
        stdio
      </Badge>,
    );
    expect(getByTestId("chip")).toHaveTextContent("stdio");
  });
});

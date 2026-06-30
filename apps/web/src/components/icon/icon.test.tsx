import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Icon } from "./icon";

describe("Icon", () => {
  it("exposes a titled glyph as an accessible image", () => {
    const { getByRole } = render(<Icon name="check" title="done" />);
    expect(getByRole("img", { name: "done" }).tagName.toLowerCase()).toBe("svg");
  });

  it("hides a decorative (untitled) glyph from assistive tech", () => {
    const svg = render(<Icon name="check" />).container.querySelector("svg");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(svg?.getAttribute("role")).toBeNull();
  });

  it("strokes a line glyph but fills a solid one", () => {
    const stroke = render(<Icon name="check" />).container.querySelector("svg");
    expect(stroke?.getAttribute("stroke")).toBe("currentColor");
    expect(stroke?.getAttribute("fill")).toBe("none");

    const filled = render(<Icon name="sparkle" />).container.querySelector("svg");
    expect(filled?.getAttribute("fill")).toBe("currentColor");
    expect(filled?.getAttribute("stroke")).toBe("none");
  });

  it("sizes the square grid from the size prop", () => {
    const svg = render(<Icon name="x" size={24} />).container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("24");
    expect(svg?.getAttribute("height")).toBe("24");
  });
});

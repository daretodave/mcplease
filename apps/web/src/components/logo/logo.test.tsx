import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Logo, Mark } from "./logo";

describe("Logo", () => {
  it("locks up the wordmark text beside the mark svg", () => {
    const { getByText, container } = render(<Logo />);
    expect(getByText("mcplease")).toBeInTheDocument();
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders only the mark for the mark variant — no wordmark text", () => {
    const { container, queryByText } = render(<Logo variant="mark" />);
    expect(container.querySelector("svg")).not.toBeNull();
    expect(queryByText("mcplease")).toBeNull();
  });

  it("renders only the wordmark for the wordmark variant — no svg", () => {
    const { container, getByText } = render(<Logo variant="wordmark" />);
    expect(getByText("mcplease")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeNull();
  });

  it("is decorative by default — the lockup hides from assistive tech", () => {
    const wrapper = render(<Logo />).container.firstElementChild;
    expect(wrapper?.getAttribute("aria-hidden")).toBe("true");
    expect(wrapper?.getAttribute("role")).toBeNull();
  });

  it("a title turns the lockup into a labelled image", () => {
    const { getByRole } = render(<Logo title="mcplease home" />);
    const el = getByRole("img", { name: "mcplease home" });
    expect(el).toBeInTheDocument();
    expect(el).not.toHaveAttribute("aria-hidden");
  });

  it("a title labels the wordmark variant too", () => {
    const { getByRole } = render(<Logo variant="wordmark" title="mcplease" />);
    expect(getByRole("img", { name: "mcplease" })).toHaveTextContent("mcplease");
  });
});

describe("Mark", () => {
  it("is decorative by default", () => {
    const svg = render(<Mark />).container.querySelector("svg");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(svg?.getAttribute("role")).toBeNull();
  });

  it("becomes a labelled image when titled", () => {
    const { getByRole } = render(<Mark title="mcplease" />);
    expect(getByRole("img", { name: "mcplease" }).tagName.toLowerCase()).toBe("svg");
  });

  it("sizes the square grid from the size prop", () => {
    const svg = render(<Mark size={40} />).container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("40");
    expect(svg?.getAttribute("height")).toBe("40");
  });
});

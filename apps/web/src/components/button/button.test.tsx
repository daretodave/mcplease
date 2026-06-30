import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("is a real button by default", () => {
    const { getByRole } = render(<Button>Go</Button>);
    const el = getByRole("button", { name: "Go" });
    expect(el.tagName.toLowerCase()).toBe("button");
    expect(el).toHaveAttribute("type", "button");
  });

  it("becomes an anchor when given an href (a link stays a link)", () => {
    const { getByRole } = render(<Button href="/x">Open</Button>);
    const el = getByRole("link", { name: "Open" });
    expect(el.tagName.toLowerCase()).toBe("a");
    expect(el).toHaveAttribute("href", "/x");
  });

  it("loading swaps in the spinner, disables, and marks itself busy", () => {
    const { getByRole, container } = render(<Button loading>Save</Button>);
    const el = getByRole("button", { name: "Save" });
    expect(el).toBeDisabled();
    expect(el).toHaveAttribute("aria-busy", "true");
    // the loader glyph is present, the configured leading icon is not
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("hides the trailing glyph while loading", () => {
    const idle = render(<Button iconTrailing="arrow-right">Next</Button>);
    expect(idle.container.querySelectorAll("svg")).toHaveLength(1);

    const busy = render(
      <Button iconTrailing="arrow-right" loading>
        Next
      </Button>,
    );
    // only the spinner remains — the trailing arrow is gone
    expect(busy.container.querySelectorAll("svg")).toHaveLength(1);
    expect(busy.container.querySelector("button")).toHaveAttribute("aria-busy", "true");
  });

  it("renders a leading glyph alongside the label", () => {
    const { getByRole, container } = render(<Button icon="plus">Add</Button>);
    expect(getByRole("button", { name: "Add" })).toBeInTheDocument();
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("an explicitly disabled button blocks its click", () => {
    let hits = 0;
    const { getByRole } = render(
      <Button disabled onClick={() => (hits += 1)}>
        Nope
      </Button>,
    );
    getByRole("button").click();
    expect(hits).toBe(0);
  });
});

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Callout } from "./callout";

describe("Callout", () => {
  it("renders the title as the lead and the children as the body", () => {
    const { getByText } = render(
      <Callout variant="warn" title="Save your edit link">
        This is the only way back in.
      </Callout>,
    );
    const title = getByText("Save your edit link");
    expect(title.tagName.toLowerCase()).toBe("p");
    expect(getByText("This is the only way back in.")).toBeInTheDocument();
  });

  it("announces the warn and bad tones as alerts", () => {
    // two renders share document.body, so scope each assertion to its own container
    const warn = render(<Callout variant="warn">careful</Callout>);
    const warnAlert = warn.container.querySelector('[role="alert"]');
    expect(warnAlert).not.toBeNull();
    expect(warnAlert).toHaveTextContent("careful");

    const bad = render(<Callout variant="bad">broken</Callout>);
    const badAlert = bad.container.querySelector('[role="alert"]');
    expect(badAlert).not.toBeNull();
    expect(badAlert).toHaveTextContent("broken");
  });

  it("leaves the quiet tones (info, accent) without the alert role", () => {
    const info = render(<Callout>just so you know</Callout>);
    expect(info.container.querySelector('[role="alert"]')).toBeNull();

    const accent = render(<Callout variant="accent">a friendly tip</Callout>);
    expect(accent.container.querySelector('[role="alert"]')).toBeNull();
  });

  it("defaults to the info glyph (the only circled, stroked mark) for the info tone", () => {
    const svg = render(<Callout>a note</Callout>).container.querySelector("svg");
    expect(svg?.querySelector("circle")).not.toBeNull();
    expect(svg?.getAttribute("fill")).toBe("none");
  });

  it("uses the alert-triangle glyph for warn and bad (stroked, no circle)", () => {
    const warn = render(<Callout variant="warn">w</Callout>).container.querySelector("svg");
    // stroked rules out the filled sparkle; the missing circle rules out the info glyph
    expect(warn?.getAttribute("fill")).toBe("none");
    expect(warn?.querySelector("circle")).toBeNull();

    const bad = render(<Callout variant="bad">b</Callout>).container.querySelector("svg");
    expect(bad?.getAttribute("fill")).toBe("none");
    expect(bad?.querySelector("circle")).toBeNull();
  });

  it("uses the filled sparkle glyph for the accent tone", () => {
    const svg = render(<Callout variant="accent">tip</Callout>).container.querySelector("svg");
    expect(svg?.getAttribute("fill")).toBe("currentColor");
  });

  it("lets an explicit icon override the tone's default glyph", () => {
    // info would normally render its circled glyph; the override swaps in a circle-less check
    const svg = render(
      <Callout variant="info" icon="check">
        overridden
      </Callout>,
    ).container.querySelector("svg");
    expect(svg?.querySelector("circle")).toBeNull();
  });

  it("floats the action control at the end of the note", () => {
    const { getByRole } = render(
      <Callout variant="warn" title="Save it" action={<button>Copy edit link</button>}>
        once only
      </Callout>,
    );
    expect(getByRole("button", { name: "Copy edit link" })).toBeInTheDocument();
  });

  it("renders inline code inside the body", () => {
    const { container } = render(
      <Callout>
        run <code>npx mcp</code> to connect
      </Callout>,
    );
    const code = container.querySelector("code");
    expect(code).not.toBeNull();
    expect(code).toHaveTextContent("npx mcp");
  });
});

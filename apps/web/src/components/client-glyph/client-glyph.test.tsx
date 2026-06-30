import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ClientGlyph } from "./client-glyph";

describe("ClientGlyph", () => {
  it("shows the two-letter monogram for a client", () => {
    const { getByText } = render(<ClientGlyph client="cursor" />);
    expect(getByText("cu")).toBeInTheDocument();
  });

  it("uses the braces monogram for the generic target", () => {
    const { getByText } = render(<ClientGlyph client="generic" />);
    expect(getByText("{}")).toBeInTheDocument();
  });

  it("honors an explicit code override", () => {
    const { getByText } = render(<ClientGlyph client="zed" code="ZZ" />);
    expect(getByText("ZZ")).toBeInTheDocument();
  });

  it("is decorative by default and labelled when a label is given", () => {
    const decorative = render(<ClientGlyph client="vscode" />);
    expect(decorative.container.querySelector('[role="img"]')).toBeNull();
    expect(decorative.container.querySelector('[aria-hidden="true"]')).not.toBeNull();

    const labelled = render(<ClientGlyph client="vscode" label="VS Code" />);
    expect(labelled.getByRole("img", { name: "VS Code" })).toBeInTheDocument();
  });

  it("marks the selected state for tinting", () => {
    const { container } = render(<ClientGlyph client="cline" selected />);
    expect(container.querySelector('[data-selected="true"]')).not.toBeNull();
  });

  it("scales the monogram to the requested size", () => {
    const { getByText } = render(<ClientGlyph client="goose" size={40} />);
    expect(getByText("go")).toHaveStyle({ width: "40px", height: "40px" });
  });
});

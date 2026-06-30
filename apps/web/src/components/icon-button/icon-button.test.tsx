import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IconButton } from "./icon-button";

describe("IconButton", () => {
  it("exposes its label as the accessible name", () => {
    const { getByRole } = render(<IconButton icon="copy" label="Copy command" />);
    expect(getByRole("button", { name: "Copy command" })).toBeInTheDocument();
  });

  it("renders the named glyph as an svg", () => {
    const { container } = render(<IconButton icon="x" label="Dismiss" />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("fires onClick when pressed", () => {
    const onClick = vi.fn();
    const { getByRole } = render(<IconButton icon="trash" label="Delete" onClick={onClick} />);
    getByRole("button").click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("a disabled button blocks its click", () => {
    const onClick = vi.fn();
    const { getByRole } = render(
      <IconButton icon="trash" label="Delete" disabled onClick={onClick} />,
    );
    getByRole("button").click();
    expect(onClick).not.toHaveBeenCalled();
    expect(getByRole("button")).toBeDisabled();
  });

  it("forwards a native button type", () => {
    const { getByRole } = render(<IconButton icon="check" label="Submit" type="submit" />);
    expect(getByRole("button", { name: "Submit" })).toHaveAttribute("type", "submit");
  });

  it("loading shows a spinner, disables, and blocks the click", () => {
    const onClick = vi.fn();
    const { getByRole, container } = render(
      <IconButton icon="copy" label="Copying" loading onClick={onClick} />,
    );
    const el = getByRole("button", { name: "Copying" });
    expect(el).toBeDisabled();
    expect(container.querySelector("svg")).not.toBeNull();
    el.click();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("becomes a link when given an href (a link stays a link)", () => {
    const { getByRole } = render(
      <IconButton icon="github" label="View source" href="https://example.com/repo" />,
    );
    const el = getByRole("link", { name: "View source" });
    expect(el.tagName.toLowerCase()).toBe("a");
    expect(el).toHaveAttribute("href", "https://example.com/repo");
  });

  it("an href that is loading stays a disabled button, not a link", () => {
    const { getByRole, queryByRole } = render(
      <IconButton icon="link" label="Busy" href="/x" loading />,
    );
    expect(queryByRole("link")).toBeNull();
    expect(getByRole("button", { name: "Busy" })).toBeDisabled();
  });

  it("an href that is disabled stays a disabled button, not a link", () => {
    const { getByRole, queryByRole } = render(
      <IconButton icon="link" label="Off" href="/x" disabled />,
    );
    expect(queryByRole("link")).toBeNull();
    expect(getByRole("button", { name: "Off" })).toBeDisabled();
  });

  it("renders custom children in place of the icon glyph", () => {
    const { getByRole, getByText } = render(
      <IconButton label="Custom" round variant="secondary" size="sm">
        <span>ok</span>
      </IconButton>,
    );
    // the label still wins the accessible name, even with visible children
    expect(getByRole("button", { name: "Custom" })).toBeInTheDocument();
    expect(getByText("ok")).toBeInTheDocument();
  });

  it("stays an accessible button when handed no glyph", () => {
    const { getByRole, container } = render(<IconButton label="Empty" />);
    expect(getByRole("button", { name: "Empty" })).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeNull();
  });
});

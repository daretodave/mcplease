import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Input } from "./input";

describe("Input", () => {
  it("labels the input and appends a muted optional marker", () => {
    const { getByText, getByLabelText } = render(<Input label="Slug" optional />);
    expect(getByText("Slug")).toBeInTheDocument();
    expect(getByText(/optional/i)).toBeInTheDocument();
    // the label is wired to the control via htmlFor/id
    expect(getByLabelText(/Slug/).tagName.toLowerCase()).toBe("input");
  });

  it("shows the hint as the helper line", () => {
    const { getByText } = render(<Input label="Slug" hint="lowercase, 2–40 chars" />);
    expect(getByText("lowercase, 2–40 chars")).toBeInTheDocument();
  });

  it("renders an error message, flags the input invalid, and reddens the wrap", () => {
    const { getByText, getByRole, container } = render(
      <Input label="Server URL" error="That doesn't look like a URL." />,
    );
    expect(getByText("That doesn't look like a URL.")).toBeInTheDocument();
    expect(getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    expect(container.querySelector('[data-state="error"]')).not.toBeNull();
    // the alert glyph rides alongside the message
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("applies the ok semantic state to the wrap and tones the helper line", () => {
    const { container } = render(<Input state="ok" hint="Looks available" />);
    expect(container.querySelector('[data-state="ok"]')).not.toBeNull();
    // the ok message carries a tone class a neutral message does not
    const tonedClass = container.querySelector("p")?.className;
    const neutralClass = render(<Input hint="Looks available" />).container.querySelector(
      "p",
    )?.className;
    expect(tonedClass).not.toBe(neutralClass);
  });

  it("disables the control and dims the wrap", () => {
    const { getByRole, container } = render(<Input label="Locked" disabled />);
    expect(getByRole("textbox")).toBeDisabled();
    expect(container.querySelector('[data-disabled="true"]')).not.toBeNull();
  });

  it("renders inline prefix and suffix addons inside the wrap", () => {
    const { getByText } = render(<Input label="Slug" prefix="mcplease.io/" suffix="ready" mono />);
    expect(getByText("mcplease.io/")).toBeInTheDocument();
    expect(getByText("ready")).toBeInTheDocument();
  });

  it("fires onChange as the user types", () => {
    const onChange = vi.fn();
    const { getByRole } = render(<Input label="Server" value="" onChange={onChange} />);
    fireEvent.change(getByRole("textbox"), { target: { value: "https://example.com/mcp" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

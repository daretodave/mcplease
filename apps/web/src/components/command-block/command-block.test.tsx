import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CommandBlock } from "./command-block";

const writeText = vi.fn().mockResolvedValue(undefined);
Object.assign(navigator, { clipboard: { writeText } });

describe("CommandBlock", () => {
  beforeEach(() => {
    writeText.mockClear();
  });

  it("renders the command text", () => {
    const { getByText } = render(<CommandBlock command="npm install acme" />);
    expect(getByText("npm install acme")).toBeInTheDocument();
  });

  it("copies the exact command and flips to the copied state", async () => {
    const command = "claude mcp add --transport http acme https://acme.dev/mcp";
    const { getByRole, findByRole } = render(<CommandBlock command={command} />);

    getByRole("button", { name: "Copy command" }).click();

    expect(writeText).toHaveBeenCalledWith(command);
    // the confirmation seal announces itself politely (role=status) ...
    expect(await findByRole("status")).toHaveTextContent("Copied!");
    // ... and the control relabels from "Copy command" to "Copied"
    expect(getByRole("button", { name: "Copied" })).toBeInTheDocument();
  });

  it("stays non-blocking when the clipboard write is rejected", async () => {
    writeText.mockRejectedValueOnce(new Error("denied"));
    const { getByRole, findByRole } = render(<CommandBlock command="x" />);

    getByRole("button", { name: "Copy command" }).click();

    // the rejection is swallowed; the confirmation still lands
    expect(await findByRole("button", { name: "Copied" })).toBeInTheDocument();
  });

  it("fires onCopied with the copied text", () => {
    const onCopied = vi.fn();
    const { getByRole } = render(<CommandBlock command="echo hi" onCopied={onCopied} />);

    getByRole("button", { name: "Copy command" }).click();

    expect(onCopied).toHaveBeenCalledWith("echo hi");
  });

  it("uses a custom copy label while idle", () => {
    const { getByRole } = render(<CommandBlock command="ls" label="Copy install command" />);
    expect(getByRole("button", { name: "Copy install command" })).toBeInTheDocument();
  });

  it("shows the muted $ prompt only on a single line", () => {
    const single = render(<CommandBlock command="npm test" prompt />);
    expect(single.container.textContent).toContain("$");

    // a multi-line snippet is JSON, not a shell line, so the prompt is suppressed
    const multi = render(<CommandBlock command={'{\n  "url": "x"\n}'} prompt />);
    expect(multi.container.textContent).not.toContain("$");
  });

  it("block forces the multi-line layout (the shell prompt is suppressed)", () => {
    const { container } = render(<CommandBlock command="single-line" block prompt />);
    expect(container.textContent).not.toContain("$");
  });

  it("reverts to the idle state after the timeout", () => {
    vi.useFakeTimers();
    try {
      const { getByRole, queryByRole } = render(<CommandBlock command="x" />);

      act(() => {
        getByRole("button", { name: "Copy command" }).click();
      });
      expect(getByRole("button", { name: "Copied" })).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1600);
      });
      expect(queryByRole("status")).toBeNull();
      expect(getByRole("button", { name: "Copy command" })).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});

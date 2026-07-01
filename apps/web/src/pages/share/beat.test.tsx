import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BeatRow, ConnectedRow } from "./beat";
import type { Beat } from "./storyboard";

const beat: Beat = {
  title: "Run this in your terminal",
  sub: "One command adds it.",
  kind: "auth",
  scene: <div>SCENE</div>,
  copy: { text: "claude mcp add acme", prompt: true },
};

describe("BeatRow", () => {
  it("renders the number, title, sub, archetype chip, scene, and copy payload", () => {
    const { getByText } = render(<BeatRow index={2} beat={beat} />);
    expect(getByText("2")).toBeInTheDocument();
    expect(getByText("Run this in your terminal")).toBeInTheDocument();
    expect(getByText("One command adds it.")).toBeInTheDocument();
    expect(getByText("authenticate")).toBeInTheDocument(); // the BeatKind chip
    expect(getByText("SCENE")).toBeInTheDocument();
    expect(getByText("claude mcp add acme")).toBeInTheDocument();
  });

  it("fires onCopied with the command text when the copy control is used", () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const onCopied = vi.fn();
    const { getByRole } = render(<BeatRow index={1} beat={beat} onCopied={onCopied} />);
    fireEvent.click(getByRole("button", { name: "Copy command" }));
    expect(onCopied).toHaveBeenCalledWith("claude mcp add acme");
  });

  it("omits the chip and copy block for a bare beat", () => {
    const { queryByText, queryByRole } = render(
      <BeatRow index={1} beat={{ title: "Just a menu", scene: <div>M</div> }} />,
    );
    expect(queryByText("authenticate")).toBeNull();
    expect(queryByRole("button")).toBeNull();
  });

  it("renders a beat-level footnote (e.g. the static-token alternative) when present", () => {
    const { getByText } = render(
      <BeatRow
        index={1}
        beat={{ title: "Config", scene: <div>S</div>, note: "Prefer a static token?" }}
      />,
    );
    expect(getByText("Prefer a static token?")).toBeInTheDocument();
  });
});

describe("ConnectedRow", () => {
  it("caps the storyboard with the connected outcome", () => {
    const { getByText } = render(<ConnectedRow label="Connected in Cursor." />);
    expect(getByText("Connected")).toBeInTheDocument();
    expect(getByText("Connected in Cursor.")).toBeInTheDocument();
  });
});

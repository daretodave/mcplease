import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TerminalMock } from "./terminal-mock";

describe("TerminalMock", () => {
  it("renders the title and command lines", () => {
    const { getByText } = render(
      <TerminalMock
        title="bash"
        lines={[
          {
            prompt: true,
            text: "claude mcp add --transport http acme https://acme.dev/mcp",
            caret: true,
          },
        ]}
      />,
    );
    expect(getByText("bash")).toBeInTheDocument();
    expect(
      getByText("claude mcp add --transport http acme https://acme.dev/mcp"),
    ).toBeInTheDocument();
  });

  it("shows an accent prompt for prompt lines", () => {
    const { getByText } = render(
      <TerminalMock lines={[{ prompt: true, text: "goose configure" }]} />,
    );
    // the "$ " prompt is its own span
    expect(getByText("$")).toBeInTheDocument();
    expect(getByText("goose configure")).toBeInTheDocument();
  });

  it("renders dim annotation lines", () => {
    const { getByText } = render(
      <TerminalMock lines={[{ dim: true, text: "▸ Add Extension › Remote (SSE)" }]} />,
    );
    expect(getByText("▸ Add Extension › Remote (SSE)")).toBeInTheDocument();
  });
});

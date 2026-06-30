import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StepCard } from "./step-card";

describe("StepCard", () => {
  it("renders the number, title, and a string description", () => {
    const { getByText } = render(
      <StepCard
        index={2}
        title="Build it once"
        description="The author's build step, run after clone."
      />,
    );
    expect(getByText("2")).toBeInTheDocument();
    expect(getByText("Build it once")).toBeInTheDocument();
    expect(getByText("The author's build step, run after clone.")).toBeInTheDocument();
  });

  it("renders a node description with inline code", () => {
    const { getByText } = render(
      <StepCard
        title="Run this in your terminal"
        description={
          <>
            Then authorize when prompted with <code>/mcp</code>.
          </>
        }
      />,
    );
    const code = getByText("/mcp");
    expect(code.tagName).toBe("CODE");
  });

  it("renders the visual and the copy-paste command", () => {
    const { getByText } = render(
      <StepCard
        index={1}
        title="Clone the repo"
        visual={<div>terminal here</div>}
        command="git clone https://github.com/you/your-mcp"
        prompt
      />,
    );
    expect(getByText("terminal here")).toBeInTheDocument();
    expect(getByText("git clone https://github.com/you/your-mcp")).toBeInTheDocument();
  });

  it("omits the number pill when unnumbered", () => {
    const { container, getByText } = render(
      <StepCard title="Any MCP client" command="https://acme.dev/mcp" />,
    );
    expect(getByText("Any MCP client")).toBeInTheDocument();
    // no numbered pill text node
    expect(container.textContent).not.toMatch(/^\d/);
  });
});

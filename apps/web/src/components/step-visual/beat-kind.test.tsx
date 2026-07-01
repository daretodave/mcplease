import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BeatKind } from "./beat-kind";

describe("BeatKind", () => {
  it("names the authenticate archetype", () => {
    const { getByText } = render(<BeatKind kind="auth" />);
    expect(getByText("authenticate")).toBeInTheDocument();
  });

  it("distinguishes the browser variant", () => {
    const { getByText } = render(<BeatKind kind="browser" />);
    expect(getByText("authenticate · browser")).toBeInTheDocument();
  });

  it("labels the add and configure kinds", () => {
    expect(render(<BeatKind kind="add" />).getByText("add")).toBeInTheDocument();
    expect(render(<BeatKind kind="run" />).getByText("configure")).toBeInTheDocument();
  });
});

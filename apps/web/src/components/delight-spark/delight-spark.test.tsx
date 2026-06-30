import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DelightSpark } from "./delight-spark";

describe("DelightSpark", () => {
  it("always renders its children", () => {
    const { getByText } = render(
      <DelightSpark>
        <button>Copy</button>
      </DelightSpark>,
    );
    expect(getByText("Copy")).toBeInTheDocument();
  });

  it("shows no spark until it is triggered", () => {
    const { container } = render(
      <DelightSpark>
        <button>Copy</button>
      </DelightSpark>,
    );
    expect(container.querySelector("svg")).toBeNull();
  });

  it("blooms the sparkle glyph once triggered, keeping its children", () => {
    const { container, getByText } = render(
      <DelightSpark trigger={1}>
        <button>Copy</button>
      </DelightSpark>,
    );
    expect(getByText("Copy")).toBeInTheDocument();
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("keeps the spark decorative — wrapped in an aria-hidden, non-interactive layer", () => {
    const { container } = render(
      <DelightSpark trigger={1}>
        <button>Copy</button>
      </DelightSpark>,
    );
    const hidden = container.querySelector("span[aria-hidden=true]");
    expect(hidden).not.toBeNull();
    expect(hidden?.querySelector("svg")).not.toBeNull();
  });

  it("replays on each new trigger value without stacking sparks", () => {
    const { container, rerender } = render(
      <DelightSpark trigger={1}>
        <button>Copy</button>
      </DelightSpark>,
    );
    expect(container.querySelectorAll("svg")).toHaveLength(1);

    rerender(
      <DelightSpark trigger={2}>
        <button>Copy</button>
      </DelightSpark>,
    );
    expect(container.querySelectorAll("svg")).toHaveLength(1);
  });
});

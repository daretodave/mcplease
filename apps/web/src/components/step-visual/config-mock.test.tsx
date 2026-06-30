import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ConfigMock } from "./config-mock";

describe("ConfigMock", () => {
  it("renders the filename tab and each line", () => {
    const { getByText } = render(
      <ConfigMock file="settings.json" lines={["{", '  "context_servers": {', "  }", "}"]} />,
    );
    expect(getByText("settings.json")).toBeInTheDocument();
    expect(getByText('"context_servers": {', { exact: false })).toBeInTheDocument();
  });

  it("renders a highlighted server name as a real element (no injected HTML)", () => {
    const { getByText } = render(
      <ConfigMock
        lines={[
          <>
            {'    "'}
            <span data-accent>acme</span>
            {'": { "url": "https://acme.dev/mcp" }'}
          </>,
        ]}
      />,
    );
    const name = getByText("acme");
    expect(name.tagName).toBe("SPAN");
    expect(name).toHaveAttribute("data-accent");
  });
});

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BrowserScene } from "./browser-scene";

describe("BrowserScene", () => {
  it("asks to authorize the named server at the provider host", () => {
    const { getByText } = render(<BrowserScene name="acme-mcp" host="auth.acme.dev" />);
    expect(getByText("acme-mcp")).toBeInTheDocument();
    expect(getByText("auth.acme.dev/authorize")).toBeInTheDocument();
    expect(getByText("Allow")).toBeInTheDocument();
    expect(getByText("opens on its own")).toBeInTheDocument();
  });

  it("notes the trust dialog for clients that show one first", () => {
    const { getByText } = render(<BrowserScene name="acme-mcp" trust />);
    expect(getByText("after the trust dialog · opens on its own")).toBeInTheDocument();
  });
});

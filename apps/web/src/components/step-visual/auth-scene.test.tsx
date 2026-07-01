import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthScene } from "./auth-scene";

describe("AuthScene", () => {
  it("shows the server, its needs-auth status, and the default Connect control", () => {
    const { getByText } = render(<AuthScene name="acme-mcp" url="https://acme.dev/mcp" />);
    expect(getByText("acme-mcp")).toBeInTheDocument();
    expect(getByText("https://acme.dev/mcp")).toBeInTheDocument();
    expect(getByText("Needs authentication")).toBeInTheDocument();
    expect(getByText("Connect")).toBeInTheDocument();
  });

  it("uses the given control label (Authenticate)", () => {
    const { getByText } = render(<AuthScene name="acme-mcp" button="Authenticate" />);
    expect(getByText("Authenticate")).toBeInTheDocument();
  });

  it("omits the url row when no url is given", () => {
    const { queryByText } = render(<AuthScene name="acme-mcp" />);
    expect(queryByText(/^https:/)).toBeNull();
  });
});

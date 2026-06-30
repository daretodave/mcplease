import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ReadmeBadge } from "./readme-badge";

describe("ReadmeBadge", () => {
  it("renders the connect shield by default (left MCP + right CTA)", () => {
    const { getByText } = render(<ReadmeBadge />);
    expect(getByText("MCP")).toBeInTheDocument();
    expect(getByText("Connect to MCP")).toBeInTheDocument();
  });

  it("renders the info variant as name · transport", () => {
    const { getByText } = render(<ReadmeBadge variant="info" name="acme" transport="stdio" />);
    expect(getByText("acme")).toBeInTheDocument();
    expect(getByText("stdio")).toBeInTheDocument();
  });

  it("renders the neutral not-found degraded state", () => {
    const { getByText } = render(<ReadmeBadge variant="notFound" />);
    expect(getByText("link not found")).toBeInTheDocument();
  });

  it("is a link to the connect page when given an href", () => {
    const { getByRole } = render(<ReadmeBadge href="https://mcplease.io/acme" />);
    const link = getByRole("link");
    expect(link).toHaveAttribute("href", "https://mcplease.io/acme");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });
});

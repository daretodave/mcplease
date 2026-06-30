import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Placeholder } from "./placeholder";

describe("Placeholder", () => {
  it("renders its title and blurb", () => {
    render(<Placeholder title="mcplease" blurb="Share an MCP server as a link." />);
    expect(screen.getByRole("heading", { name: "mcplease" })).toBeInTheDocument();
    expect(screen.getByText("Share an MCP server as a link.")).toBeInTheDocument();
  });

  it("links to the source repository", () => {
    render(<Placeholder title="t" blurb="b" />);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://github.com/daretodave/mcplease",
    );
  });
});

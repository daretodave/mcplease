import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "./footer";

describe("Footer", () => {
  it("links Terms and Privacy at their internal routes", () => {
    const { getByRole } = render(<Footer />);
    expect(getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms");
    expect(getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
  });

  it("opens the GitHub source in a new tab with a safe rel and an accessible name", () => {
    const { getByRole } = render(<Footer />);
    const gh = getByRole("link", { name: /github/i });
    expect(gh.tagName.toLowerCase()).toBe("a");
    expect(gh).toHaveAttribute("href", "https://github.com/daretodave/mcplease");
    expect(gh).toHaveAttribute("target", "_blank");
    const rel = gh.getAttribute("rel") ?? "";
    expect(rel).toContain("noreferrer");
    expect(rel).toContain("noopener");
  });

  it("points the GitHub link at a caller-supplied source url", () => {
    const { getByRole } = render(<Footer sourceUrl="https://github.com/acme/widgets" />);
    expect(getByRole("link", { name: /github/i })).toHaveAttribute(
      "href",
      "https://github.com/acme/widgets",
    );
  });

  it("is a contentinfo landmark showing the MIT note and no copyright line", () => {
    const { getByRole, getByText } = render(<Footer />);
    const footer = getByRole("contentinfo");
    expect(footer).toBeInTheDocument();
    expect(getByText(/open source/i)).toBeInTheDocument();
    expect(footer.textContent ?? "").not.toMatch(/©|copyright/i);
  });

  it("merges a caller class onto the root footer", () => {
    const { getByRole } = render(<Footer className="page-footer" />);
    expect(getByRole("contentinfo")).toHaveClass("page-footer");
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TermsPage } from "./terms";

describe("TermsPage", () => {
  it("renders the Terms page with its seven sections", () => {
    render(<TermsPage />);
    expect(screen.getByRole("heading", { level: 1, name: "Terms" })).toBeInTheDocument();
    expect(
      screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent?.replace(/^\d+/, "")),
    ).toEqual([
      "The service",
      "Your content",
      "The rules",
      "Our part",
      "Other people’s stuff",
      "No warranty, tiny liability",
      "Changes & questions",
    ]);
  });

  it("states the ownership model: holding the edit link is ownership, and it can't be recovered", () => {
    render(<TermsPage />);
    expect(screen.getByText(/Holding the edit link is ownership\./)).toBeInTheDocument();
    expect(screen.getByText(/we can’t\s*look yours up, resend it/i)).toBeInTheDocument();
  });

  it("keeps the load-bearing legal phrases — as-is service, liability, MIT for the code", () => {
    render(<TermsPage />);
    expect(screen.getByText(/“as is” and “as available”/)).toBeInTheDocument();
    expect(screen.getByText(/not liable for any damages/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "MIT license" })).toHaveAttribute(
      "href",
      "https://github.com/daretodave/mcplease/blob/main/LICENSE",
    );
  });

  it("disclaims affiliation with the clients the connect pages depict", () => {
    render(<TermsPage />);
    expect(screen.getByText(/not affiliated with or endorsed by/)).toBeInTheDocument();
  });

  it("routes questions and takedowns to the repo's issues", () => {
    render(<TermsPage />);
    expect(screen.getByRole("link", { name: "open an issue" })).toHaveAttribute(
      "href",
      "https://github.com/daretodave/mcplease/issues",
    );
  });
});

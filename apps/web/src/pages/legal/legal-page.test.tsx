import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LegalPage, LegalSection } from "./legal-page";

function renderExample() {
  return render(
    <LegalPage
      title="Example"
      updated="July 18, 2026"
      lead="The lead paragraph."
      shortVersion={["First honest line.", "Second honest line."]}
    >
      <LegalSection index={1} title="Alpha">
        <p>Alpha body.</p>
      </LegalSection>
      <LegalSection index={12} title="Beta">
        <p>Beta body.</p>
      </LegalSection>
    </LegalPage>,
  );
}

describe("LegalPage", () => {
  it("renders the title, the updated stamp, and the lead", () => {
    renderExample();
    expect(screen.getByRole("heading", { level: 1, name: "Example" })).toBeInTheDocument();
    expect(screen.getByText("Updated July 18, 2026")).toBeInTheDocument();
    expect(screen.getByText("The lead paragraph.")).toBeInTheDocument();
  });

  it("puts the short version before the long words", () => {
    renderExample();
    expect(screen.getByText("The short version")).toBeInTheDocument();
    expect(screen.getByText("First honest line.")).toBeInTheDocument();
    expect(screen.getByText("Second honest line.")).toBeInTheDocument();
  });

  it("wears the standard page chrome — home link, theme toggle, footer", () => {
    renderExample();
    expect(screen.getByRole("link", { name: "mcplease home" })).toHaveAttribute("href", "/");
    expect(
      screen.getByRole("button", { name: /switch to (light|dark) theme/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms");
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: /GitHub/ })).toHaveAttribute(
      "href",
      "https://github.com/daretodave/mcplease",
    );
  });
});

describe("LegalSection", () => {
  it("renders an h2 whose accessible name is the title alone — the number chip is decorative", () => {
    renderExample();
    expect(screen.getByRole("heading", { level: 2, name: "Alpha" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Beta" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /01/ })).not.toBeInTheDocument();
  });

  it("pads the section number to two digits and leaves larger indexes alone", () => {
    renderExample();
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("renders its prose children", () => {
    renderExample();
    expect(screen.getByText("Alpha body.")).toBeInTheDocument();
    expect(screen.getByText("Beta body.")).toBeInTheDocument();
  });
});

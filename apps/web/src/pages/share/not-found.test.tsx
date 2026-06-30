import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { NotFoundScreen } from "./not-found";

function renderIn(ui: React.ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("NotFoundScreen", () => {
  it("echoes the slug that didn't resolve", () => {
    renderIn(<NotFoundScreen slug="ghost" />);
    expect(screen.getByText("mcplease.io/ghost")).toBeInTheDocument();
    expect(screen.getByText("This link doesn’t resolve.")).toBeInTheDocument();
  });

  it("falls back to a placeholder slug", () => {
    renderIn(<NotFoundScreen />);
    expect(screen.getByText("mcplease.io/this-link")).toBeInTheDocument();
  });

  it("offers a way forward to create a link", () => {
    renderIn(<NotFoundScreen slug="ghost" />);
    expect(screen.getByRole("button", { name: /Create a link/ })).toBeInTheDocument();
  });
});

import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MenuMock } from "./menu-mock";

describe("MenuMock", () => {
  it("renders the app, breadcrumb, and rows", () => {
    const { getByText } = render(
      <MenuMock
        app="Cursor"
        crumb="MCP"
        items={[
          { label: "Installed servers", right: "2" },
          { label: "Add new MCP server", on: true },
        ]}
      />,
    );
    expect(getByText("Cursor")).toBeInTheDocument();
    expect(getByText("MCP")).toBeInTheDocument();
    expect(getByText("Installed servers")).toBeInTheDocument();
    expect(getByText("Add new MCP server")).toBeInTheDocument();
  });

  it("marks the active row with a click hint and shows right hints only on inactive rows", () => {
    const { getByText, queryAllByText } = render(
      <MenuMock
        items={[
          { label: "Installed servers", right: "2" },
          { label: "Add new MCP server", on: true },
        ]}
      />,
    );
    expect(getByText("click →")).toBeInTheDocument();
    expect(getByText("2")).toBeInTheDocument();
    // the active row has no right hint, so only one "2" exists
    expect(queryAllByText("2")).toHaveLength(1);
  });

  it("renders an optional note", () => {
    const { getByText } = render(<MenuMock note="developer mode required" />);
    expect(getByText("developer mode required")).toBeInTheDocument();
  });
});

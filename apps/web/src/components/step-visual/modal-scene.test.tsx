import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ModalScene } from "./modal-scene";

describe("ModalScene", () => {
  it("renders the dialog title, the BETA tag, and the Add control", () => {
    const { getByText } = render(
      <ModalScene fields={[{ label: "Name", value: "Acme MCP", filled: true }]} />,
    );
    expect(getByText("Add custom connector")).toBeInTheDocument();
    expect(getByText("BETA")).toBeInTheDocument();
    expect(getByText("Add")).toBeInTheDocument();
  });

  it("shows a filled field's value and an empty field's placeholder label", () => {
    const { getByText, queryByText } = render(
      <ModalScene
        fields={[
          { label: "Name", value: "Acme MCP", filled: true },
          { label: "Remote MCP server URL", mono: true },
        ]}
      />,
    );
    expect(getByText("Acme MCP")).toBeInTheDocument();
    expect(getByText("Remote MCP server URL")).toBeInTheDocument();
    expect(queryByText("Name")).toBeNull();
  });
});

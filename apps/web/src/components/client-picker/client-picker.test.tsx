import { fireEvent, render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ClientPicker } from "./client-picker";

describe("ClientPicker", () => {
  it("shows all ten clients for an http link", () => {
    const { getAllByRole } = render(
      <ClientPicker value="claude-code" onChange={() => {}} transport="http" />,
    );
    expect(getAllByRole("radio")).toHaveLength(10);
  });

  it("hides ChatGPT for a stdio link", () => {
    const { getAllByRole, queryByText } = render(
      <ClientPicker value="claude-code" onChange={() => {}} transport="stdio" />,
    );
    expect(getAllByRole("radio")).toHaveLength(9);
    expect(queryByText("ChatGPT")).toBeNull();
  });

  it("marks the selected client and tags one-click support", () => {
    const { getByRole, getAllByText, getByText } = render(
      <ClientPicker value="cursor" onChange={() => {}} transport="http" />,
    );
    expect(getByRole("radio", { name: /Cursor/ })).toHaveAttribute("aria-checked", "true");
    // cursor + vscode are full one-click; claude-desktop is partial
    expect(getAllByText("1-click add")).toHaveLength(2);
    expect(getByText("1-click · partial")).toBeInTheDocument();
  });

  it("hides the partial one-click tag on a stdio link (partial is http-only)", () => {
    const { getAllByText, queryByText } = render(
      <ClientPicker value="cursor" onChange={() => {}} transport="stdio" />,
    );
    // Claude Desktop's partial one-click never fires on stdio, so it must not be advertised.
    expect(queryByText("1-click · partial")).toBeNull();
    // Cursor + VS Code stay full one-click on stdio.
    expect(getAllByText("1-click add")).toHaveLength(2);
  });

  it("selects a client on click", () => {
    const onChange = vi.fn();
    const { getByRole } = render(
      <ClientPicker value="claude-code" onChange={onChange} transport="http" />,
    );
    fireEvent.click(getByRole("radio", { name: /Zed/ }));
    expect(onChange).toHaveBeenCalledWith("zed");
  });

  it("moves the choice with arrow keys, wrapping", () => {
    const onChange = vi.fn();
    const { getByRole } = render(
      <ClientPicker value="claude-code" onChange={onChange} transport="http" />,
    );
    fireEvent.keyDown(getByRole("radio", { name: /Claude Code/ }), { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith("claude-desktop");
    onChange.mockClear();
    fireEvent.keyDown(getByRole("radio", { name: /Claude Code/ }), { key: "ArrowLeft" });
    expect(onChange).toHaveBeenCalledWith("generic"); // wraps to the last
  });
});

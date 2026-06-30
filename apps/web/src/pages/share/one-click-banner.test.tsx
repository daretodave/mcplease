import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OneClickBanner } from "./one-click-banner";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("OneClickBanner", () => {
  it("names the client and explains a full one-click", () => {
    render(<OneClickBanner client="cursor" mode="full" href="cursor://x" onAdd={() => {}} />);
    expect(screen.getByText("Add to Cursor in one click")).toBeInTheDocument();
    expect(screen.getByText(/Opens Cursor and installs/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add to Cursor/ })).toBeInTheDocument();
  });

  it("explains the partial flow finishes in-app", () => {
    render(<OneClickBanner client="claude-desktop" mode="partial" href={null} onAdd={() => {}} />);
    expect(screen.getByText(/you may finish a step in-app/)).toBeInTheDocument();
  });

  it("tracks the add and hands a full client its deep link", () => {
    const onAdd = vi.fn();
    // jsdom's location.assign is non-configurable, so swap the whole location for an observable stub.
    const assign = vi.fn();
    vi.stubGlobal("location", { assign });
    render(
      <OneClickBanner client="cursor" mode="full" href="cursor://install/acme" onAdd={onAdd} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Add to Cursor/ }));
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(assign).toHaveBeenCalledWith("cursor://install/acme");
    // The success beat replaces the label.
    expect(screen.getByRole("button", { name: /Added/ })).toBeInTheDocument();
  });

  it("tracks the add for a partial client without navigating", () => {
    const onAdd = vi.fn();
    const assign = vi.fn();
    vi.stubGlobal("location", { assign });
    render(<OneClickBanner client="claude-desktop" mode="partial" href={null} onAdd={onAdd} />);
    fireEvent.click(screen.getByRole("button", { name: /Add to Claude Desktop/ }));
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(assign).not.toHaveBeenCalled();
  });

  it("announces the add to assistive tech via a live region", () => {
    render(<OneClickBanner client="claude-desktop" mode="partial" href={null} onAdd={() => {}} />);
    // Before the tap the live region is empty.
    expect(screen.getByRole("status")).toHaveTextContent("");
    fireEvent.click(screen.getByRole("button", { name: /Add to Claude Desktop/ }));
    expect(screen.getByRole("status")).toHaveTextContent("Added to Claude Desktop");
  });
});

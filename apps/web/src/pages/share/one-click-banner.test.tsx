import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OneClickBanner } from "./one-click-banner";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("OneClickBanner", () => {
  it("names the client and explains a scheme one-click honestly", () => {
    render(<OneClickBanner client="cursor" href="cursor://x" onAdd={() => {}} />);
    expect(screen.getByText("Add to Cursor in one click")).toBeInTheDocument();
    expect(screen.getByText("Opens Cursor and adds the server.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add to Cursor/ })).toBeInTheDocument();
  });

  it("explains a web link (Claude) opens the app to review and confirm", () => {
    render(
      <OneClickBanner
        client="claude-desktop"
        href="https://claude.ai/customize/connectors?modal=add-custom-connector"
        onAdd={() => {}}
      />,
    );
    expect(screen.getByText(/review and confirm/)).toBeInTheDocument();
  });

  it("hands a scheme client its deep link and infers success from the page losing focus", () => {
    const onAdd = vi.fn();
    // jsdom's location.assign is non-configurable, so swap the whole location for an observable stub.
    const assign = vi.fn();
    vi.stubGlobal("location", { assign });
    render(<OneClickBanner client="cursor" href="cursor://install/acme" onAdd={onAdd} />);
    fireEvent.click(screen.getByRole("button", { name: /Add to Cursor/ }));
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(assign).toHaveBeenCalledWith("cursor://install/acme");
    // Before the OS hands off, the honest label is "Opening…", never "Added".
    expect(screen.getByRole("button", { name: /Opening Cursor/ })).toBeInTheDocument();
    // The OS hands off → the page blurs → we infer the launch worked.
    act(() => {
      window.dispatchEvent(new Event("blur"));
    });
    expect(screen.getByRole("button", { name: /Sent to Cursor/ })).toBeInTheDocument();
  });

  it("reveals the manual fallback when a scheme never opens (no handler registered)", () => {
    vi.useFakeTimers();
    const assign = vi.fn();
    vi.stubGlobal("location", { assign });
    render(<OneClickBanner client="cursor" href="cursor://nope" onAdd={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /Add to Cursor/ }));
    expect(screen.getByRole("button", { name: /Opening Cursor/ })).toBeInTheDocument();
    // Nothing grabbed focus within the window → fall back to the manual steps.
    act(() => {
      vi.advanceTimersByTime(2300);
    });
    expect(screen.getByText(/didn’t open — follow the steps below/)).toBeInTheDocument();
    // The button reverts so the reader can retry.
    expect(screen.getByRole("button", { name: /Add to Cursor/ })).toBeInTheDocument();
  });

  it("opens a Claude web link in a new tab, with no scheme navigation", () => {
    const onAdd = vi.fn();
    const assign = vi.fn();
    const open = vi.fn();
    vi.stubGlobal("location", { assign });
    vi.stubGlobal("open", open);
    const href =
      "https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=acme";
    render(<OneClickBanner client="claude-desktop" href={href} onAdd={onAdd} />);
    fireEvent.click(screen.getByRole("button", { name: /Add to Claude Desktop/ }));
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledWith(href, "_blank", "noopener,noreferrer");
    expect(assign).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /Sent to Claude Desktop/ })).toBeInTheDocument();
  });

  it("announces progress to assistive tech via a live region", () => {
    const assign = vi.fn();
    vi.stubGlobal("location", { assign });
    render(<OneClickBanner client="cursor" href="cursor://x" onAdd={() => {}} />);
    expect(screen.getByRole("status").textContent).toBe("");
    fireEvent.click(screen.getByRole("button", { name: /Add to Cursor/ }));
    expect(screen.getByRole("status")).toHaveTextContent("Opening Cursor");
  });
});

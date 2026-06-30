import { fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// A controllable sitekey: the component reads it from env at render, so the getter lets each test choose
// whether the dev fallback or the real widget path runs.
const cfg = vi.hoisted(() => ({ sitekey: "" }));
vi.mock("../../lib/env", () => ({
  env: {
    get turnstileSitekey() {
      return cfg.sitekey;
    },
    supabaseUrl: "http://localhost",
    supabaseAnonKey: "anon",
    ga4MeasurementId: "",
  },
}));

import { Turnstile } from "./turnstile";

function setTurnstile(value: unknown) {
  (window as unknown as { turnstile: unknown }).turnstile = value;
}

describe("Turnstile", () => {
  beforeEach(() => {
    cfg.sitekey = "";
    setTurnstile(undefined);
  });
  afterEach(() => setTurnstile(undefined));

  it("with no sitekey, shows the verified row and passes a sentinel token through", async () => {
    const onVerify = vi.fn();
    const { getByText } = render(<Turnstile onVerify={onVerify} />);

    expect(getByText(/verified by Turnstile/i)).toBeInTheDocument();
    // a non-null sentinel, so a local dev submit isn't blocked on a check that can't run
    await waitFor(() => expect(onVerify).toHaveBeenCalledWith(expect.any(String)));
    expect(onVerify.mock.calls[0]?.[0]).toBeTruthy();
  });

  it("with a sitekey, renders the widget and forwards its token, then cleans up", async () => {
    cfg.sitekey = "1x-test-sitekey";
    const renderWidget = vi.fn(
      (_el: HTMLElement, opts: { sitekey: string; callback: (t: string) => void }) => {
        opts.callback("token-xyz");
        return "widget-1";
      },
    );
    const removeWidget = vi.fn();
    setTurnstile({ render: renderWidget, remove: removeWidget });

    const onVerify = vi.fn();
    const { unmount } = render(<Turnstile onVerify={onVerify} />);

    await waitFor(() => expect(onVerify).toHaveBeenCalledWith("token-xyz"));
    expect(renderWidget).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ sitekey: "1x-test-sitekey" }),
    );

    unmount();
    expect(removeWidget).toHaveBeenCalledWith("widget-1");
  });

  it("surfaces a load failure, then recovers and forwards a token on Retry", async () => {
    cfg.sitekey = "1x-fail-key";
    const onVerify = vi.fn();
    const { getByText, getByRole } = render(<Turnstile onVerify={onVerify} />);

    // The injected script fails (a blocked third party, an offline moment): the row says so and offers a
    // retry, instead of leaving an empty box and a submit button that's silently, permanently disabled.
    const script = document.querySelector(
      'script[src*="turnstile/v0/api.js"]',
    ) as HTMLScriptElement | null;
    expect(script).not.toBeNull();
    script?.onerror?.(new Event("error"));

    await waitFor(() => expect(getByText(/couldn.t load the human-check/i)).toBeInTheDocument());
    // submit is told there's no token while the check is down
    expect(onVerify).toHaveBeenCalledWith(null);

    // Retry: the api is reachable now, so the widget mounts on the re-attempt and hands its token through.
    const renderWidget = vi.fn((_el: HTMLElement, opts: { callback: (t: string) => void }) => {
      opts.callback("after-retry");
      return "w-retry";
    });
    setTurnstile({ render: renderWidget, remove: vi.fn() });
    fireEvent.click(getByRole("button", { name: "Retry" }));

    await waitFor(() => expect(onVerify).toHaveBeenCalledWith("after-retry"));
  });

  it("injects the Turnstile script when the api isn't loaded yet, then renders on load", async () => {
    cfg.sitekey = "1x-load-key";
    const onVerify = vi.fn();
    render(<Turnstile onVerify={onVerify} />);

    const script = document.querySelector(
      'script[src*="turnstile/v0/api.js"]',
    ) as HTMLScriptElement | null;
    expect(script).not.toBeNull();

    // the api object appears and the script signals load → the widget mounts and forwards its token
    const renderWidget = vi.fn((_el: HTMLElement, opts: { callback: (t: string) => void }) => {
      opts.callback("loaded-token");
      return "w-load";
    });
    setTurnstile({ render: renderWidget, remove: vi.fn() });
    script?.onload?.(new Event("load"));

    await waitFor(() => expect(onVerify).toHaveBeenCalledWith("loaded-token"));
  });
});

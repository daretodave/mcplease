import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { clearSink, emit } from "./core.js";
import { initGa4, setAnalyticsConsent } from "./web.js";

const SCRIPT_ID = "mcplease-ga4";

function commands(): unknown[][] {
  return (window.dataLayer ?? []).filter((e): e is unknown[] => Array.isArray(e));
}

beforeEach(() => {
  document.getElementById(SCRIPT_ID)?.remove();
  delete window.dataLayer;
  clearSink();
});
afterEach(() => clearSink());

describe("initGa4", () => {
  it("is a complete no-op without a measurement id", () => {
    initGa4();
    initGa4("");
    expect(document.getElementById(SCRIPT_ID)).toBeNull();
    expect(window.dataLayer).toBeUndefined();
    // the sink stays the silent default — a push does nothing, never throws
    expect(() => emit("create_submit", { transport: "http" })).not.toThrow();
  });

  it("injects the gtag script, defaults consent to denied, and configures GA4", () => {
    initGa4("G-TEST123");
    const script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    expect(script?.src).toContain("https://www.googletagmanager.com/gtag/js?id=G-TEST123");

    const consentDefault = commands().find((c) => c[0] === "consent" && c[1] === "default");
    expect(consentDefault?.[2]).toMatchObject({ analytics_storage: "denied" });
    const config = commands().find((c) => c[0] === "config");
    expect(config).toEqual(["config", "G-TEST123", { anonymize_ip: true }]);
  });

  it("routes a tracked event through the GA4 sink", () => {
    initGa4("G-TEST123");
    emit("share_one_click", { client: "cursor", transport: "http" });
    const last = commands().at(-1);
    expect(last).toEqual(["event", "share_one_click", { client: "cursor", transport: "http" }]);
  });

  it("is idempotent (a second call adds no second script)", () => {
    initGa4("G-TEST123");
    initGa4("G-TEST123");
    expect(document.querySelectorAll(`#${SCRIPT_ID}`)).toHaveLength(1);
  });
});

describe("setAnalyticsConsent", () => {
  it("pushes a consent update for all four signals", () => {
    setAnalyticsConsent("granted");
    const update = commands().find((c) => c[0] === "consent" && c[1] === "update");
    expect(update?.[2]).toEqual({
      analytics_storage: "granted",
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    });
  });
});

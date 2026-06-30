// The WEB binding for @mcplease/analytics: GA4 via gtag.js + the dataLayer, behind the "/web" subpath
// so the agnostic core never drags in DOM code (the core-vs-/web split @mcplease/data uses too).
// Consent Mode v2 defaults to DENIED, set on the dataLayer BEFORE the gtag script loads, so nothing is
// sent until a grant arrives. GA4 only, anonymous — IP anonymized, no ad signals.

import { setSink, type Sink } from "./core.js";
import type { ConsentState } from "./events.js";

// The dataLayer holds heterogeneous entries: our event objects and gtag command arrays.
type DataLayerEntry = Record<string, unknown> | unknown[];

declare global {
  interface Window {
    dataLayer?: DataLayerEntry[];
  }
}

const GA_SCRIPT_ID = "mcplease-ga4";

function dataLayer(): DataLayerEntry[] {
  return (window.dataLayer ??= []);
}

/** Push a gtag command — gtag.js reads array-form commands off the dataLayer. */
function gtag(...args: unknown[]): void {
  dataLayer().push(args);
}

/** The four Consent Mode v2 signals, defaulted to denied (so GA4 stays cookieless until a grant). */
function setConsentDefault(): void {
  gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

/** The sink that turns a lawful event payload into a GA4 `event` command. */
const ga4Sink: Sink = ({ event, ...params }) => {
  gtag("event", event, params);
};

/** Flip the consent signals — called by the consent opt-in when the user resolves it. GA4's
 *  built-in consent checks read these automatically. */
export function setAnalyticsConsent(state: ConsentState): void {
  gtag("consent", "update", {
    analytics_storage: state,
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
  });
}

/** Boot GA4. No measurement id → a complete no-op (dev / unit / hermetic E2E stay beacon-free and the
 *  sink stays the silent default). With an id: register the GA4 sink, set consent DEFAULT-DENIED, then
 *  inject the gtag.js script. Idempotent. */
export function initGa4(measurementId?: string): void {
  if (!measurementId) return;
  if (document.getElementById(GA_SCRIPT_ID)) return;

  setSink(ga4Sink);
  setConsentDefault();
  gtag("js", new Date());
  gtag("config", measurementId, { anonymize_ip: true });

  const script = document.createElement("script");
  script.id = GA_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
}

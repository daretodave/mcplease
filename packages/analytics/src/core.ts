import type { McpleaseEvent, ParamsOf } from "./events.js";

/** A sink receives a built, lawful event payload and forwards it to a backend. The web binding
 *  (@mcplease/analytics/web) registers the GA4 sink. The default is a silent no-op, so any push before
 *  a sink is installed — dev, unit tests, the hermetic E2E run — is dropped, never thrown.
 *
 *  The sink registry lives here, NOT in track.ts, so the web binding (which only needs setSink) doesn't
 *  drag the whole `track.*` verb namespace into first paint — the verbs tree-shake until a call site
 *  actually uses one (the byte ceiling). */
export type Sink = (payload: { event: McpleaseEvent } & Record<string, unknown>) => void;

const noop: Sink = () => {};
let activeSink: Sink = noop;

/** Install the active sink (the platform binding calls this once, e.g. from initGa4). */
export function setSink(sink: Sink): void {
  activeSink = sink;
}

/** Drop back to the silent default (test teardown). */
export function clearSink(): void {
  activeSink = noop;
}

/** Build the lawful payload (event + params) and hand it to the active sink. */
export function emit<E extends McpleaseEvent>(event: E, params: ParamsOf<E>): void {
  activeSink({ event, ...params });
}

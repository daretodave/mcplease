import { css } from "../../../styled-system/css";
import { Icon } from "../icon/icon";

// The small "connected" seal that closes every storyboard — the reader ends on "it's working", not a bare
// "Added". A filled check on the OK-green wash; the label names the finish line for that client.

const cap = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "[10px]",
  padding: "[11px 14px]",
  borderRadius: "md",
  background: "state.ok.soft",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "state.ok.line",
});

const mark = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: "0",
  width: "[22px]",
  height: "[22px]",
  borderRadius: "round",
  background: "state.ok",
  color: "accent.fg",
});

const labelClass = css({
  fontFamily: "sans",
  fontSize: "sm",
  fontWeight: "semibold",
  color: "state.ok.text",
});

export interface ConnectedCapProps {
  /** The finish-line copy for this client, e.g. "Connected in Cursor." */
  label?: string;
}

/** The connected seal that ends a client's storyboard. */
export function ConnectedCap({ label = "Connected — you’re all set." }: ConnectedCapProps) {
  return (
    <div className={cap}>
      <span className={mark} aria-hidden="true">
        <Icon name="check" size={13} />
      </span>
      <span className={labelClass}>{label}</span>
    </div>
  );
}

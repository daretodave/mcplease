import { css, cx } from "../../../styled-system/css";

// Claude's "Add custom connector" dialog — the beat where the reader pastes the URL and clicks Add. The Name
// and Remote-URL fields pre-fill, the BETA tag sits by the title, and the Add control glows. (Claude only.)
// The sheet reads on the inset surface — no dimmed backdrop needed (and no scrim token to reach for).

const frame = css({ padding: "[16px]", background: "bg.inset", minHeight: "[236px]" });

const sheet = css({
  maxWidth: "[344px]",
  marginInline: "auto",
  padding: "[18px]",
  borderRadius: "lg",
  background: "bg.raised",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "border.subtle",
  boxShadow: "raised",
});

const titleRow = css({
  display: "flex",
  alignItems: "center",
  gap: "[9px]",
  marginBottom: "[7px]",
});
const titleClass = css({
  fontSize: "body",
  fontWeight: "semibold",
  color: "text.primary",
  letterSpacing: "[-0.01em]",
});
const beta = css({
  padding: "[2px 5px]",
  borderRadius: "[4px]",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "border.subtle",
  fontFamily: "mono",
  fontSize: "[8.5px]",
  letterSpacing: "[0.08em]",
  color: "text.faint",
});
const lede = css({
  fontSize: "xs",
  color: "text.muted",
  lineHeight: "[1.5]",
  marginBottom: "[13px]",
});

const fieldStack = css({ display: "flex", flexDirection: "column", gap: "[9px]" });
const fieldBase = css({
  padding: "[9px 11px]",
  borderRadius: "md",
  background: "bg.inset",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "border.subtle",
  fontSize: "xs",
  color: "text.faint",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});
const fieldFilled = css({ borderColor: "accent.line", color: "text.primary" });
const fieldMono = css({ fontFamily: "mono" });

const actions = css({
  display: "flex",
  justifyContent: "flex-end",
  gap: "[8px]",
  marginTop: "[15px]",
});
const cancel = css({
  padding: "[8px 14px]",
  borderRadius: "md",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "border.subtle",
  fontSize: "sm",
  fontWeight: "semibold",
  color: "text.muted",
});
const add = css({
  padding: "[8px 18px]",
  borderRadius: "md",
  background: "accent.base",
  color: "accent.fg",
  fontSize: "sm",
  fontWeight: "semibold",
  boxShadow: "glow",
});

export interface ModalField {
  label: string;
  value?: string;
  filled?: boolean;
  mono?: boolean;
}

export interface ModalSceneProps {
  title?: string;
  fields: ModalField[];
  primary?: string;
}

/** Claude's Add-custom-connector dialog — pre-filled fields and a glowing Add. */
export function ModalScene({
  title = "Add custom connector",
  fields,
  primary = "Add",
}: ModalSceneProps) {
  return (
    <div className={frame}>
      <div className={sheet}>
        <div className={titleRow}>
          <span className={titleClass}>{title}</span>
          <span className={beta}>BETA</span>
        </div>
        <div className={lede}>Connect Claude to your data and tools.</div>
        <div className={fieldStack}>
          {fields.map((f) => (
            <div
              key={f.label}
              className={cx(fieldBase, f.filled && fieldFilled, f.mono && fieldMono)}
            >
              {f.filled ? f.value : f.label}
            </div>
          ))}
        </div>
        <div className={actions}>
          <span className={cancel}>Cancel</span>
          <span className={add}>{primary}</span>
        </div>
      </div>
    </div>
  );
}

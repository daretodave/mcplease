import { useRef } from "react";
import type { KeyboardEvent } from "react";
import { css } from "../../../styled-system/css";
import { clientsForTransport, type ClientId } from "@mcplease/client-matrix";
import type { LinkKind } from "@mcplease/model";
import { ClientGlyph } from "../client-glyph/client-glyph";

// The transport-aware grid of connect targets. The reader picks theirs; the chosen tile tints accent.
// Clients that advertise a one-click install carry a small tag. A real radiogroup: roving tabindex, arrow
// keys move the choice (wrapping), click selects. A `stdio` link drops remote-only ChatGPT.

const grid = css({
  display: "grid",
  gridTemplateColumns: "[repeat(auto-fill, minmax(156px, 1fr))]",
  gap: "2",
});

const tile = css({
  display: "flex",
  alignItems: "center",
  gap: "[10px]",
  padding: "[9px 11px]",
  textAlign: "left",
  cursor: "pointer",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "border.subtle",
  borderRadius: "md",
  background: "bg.surface",
  transitionProperty: "[border-color, background, box-shadow]",
  transitionDuration: "fast",
  transitionTimingFunction: "out",
  _hover: { borderColor: "border.strong", background: "bg.raised" },
  _focusVisible: { outline: "none", boxShadow: "ring" },
  "&[data-selected=true]": {
    borderColor: "accent.base",
    background: "accent.soft",
    boxShadow: "[inset 0 0 0 1px token(colors.accent.base)]",
  },
});

const meta = css({ display: "flex", flexDirection: "column", gap: "[2px]", minWidth: "[0]" });
const labelClass = css({
  fontSize: "sm",
  fontWeight: "medium",
  color: "text.primary",
  lineHeight: "[1.2]",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});
const tagClass = css({
  fontSize: "xs",
  color: "accent.text",
  fontWeight: "medium",
  lineHeight: "[1]",
});

export interface ClientPickerProps {
  /** The selected client id. */
  value: ClientId;
  /** Fired with the newly chosen client id. */
  onChange: (id: ClientId) => void;
  /** Filters the grid; a `stdio` link hides ChatGPT. */
  transport: LinkKind;
  /** a11y label for the radiogroup. */
  label?: string;
}

/** The client grid. Pick filters by transport; selection drives the steps below it. */
export function ClientPicker({
  value,
  onChange,
  transport,
  label = "Pick your client",
}: ClientPickerProps) {
  const list = clientsForTransport(transport);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const hasSelection = list.some((c) => c.id === value);

  const move = (from: number, delta: number) => {
    if (list.length === 0) return;
    const next = (from + delta + list.length) % list.length;
    const entry = list[next];
    if (entry) {
      onChange(entry.id);
      refs.current[next]?.focus();
    }
  };

  const onKeyDown = (event: KeyboardEvent, i: number) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      move(i, 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      move(i, -1);
    } else if (event.key === "Home") {
      event.preventDefault();
      move(-1, 1);
    } else if (event.key === "End") {
      event.preventDefault();
      move(0, -1);
    }
  };

  return (
    <div role="radiogroup" aria-label={label} className={grid}>
      {list.map((c, i) => {
        const selected = c.id === value;
        return (
          <button
            key={c.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            data-selected={selected || undefined}
            tabIndex={selected || (!hasSelection && i === 0) ? 0 : -1}
            className={tile}
            onClick={() => onChange(c.id)}
            onKeyDown={(event) => onKeyDown(event, i)}
          >
            <ClientGlyph client={c.id} size={32} selected={selected} />
            <span className={meta}>
              <span className={labelClass}>{c.label}</span>
              {/* Only advertise one-click where the banner will actually offer it: full clients on any
                  transport, partial (Claude Desktop) on http only — never on a stdio link. */}
              {c.oneClick !== "none" && (transport === "http" || c.oneClick === "full") && (
                <span className={tagClass}>
                  {c.oneClick === "partial" ? "1-click · partial" : "1-click add"}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

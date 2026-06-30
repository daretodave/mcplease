import { css } from "../../../styled-system/css";

// The mcplease brand lockup — the speech-bubble Mark, the lowercase wordmark, or the two locked up.
// The Mark is a friendly speech bubble whose bold check reads as "yes, granted"; it themes through the
// accent tokens (the bubble is accent.base, the check is accent.fg) so it flips with the light/dark
// theme. Everything is decorative by default — pass a `title` to expose it as a labelled image.

const markClass = css({ display: "block", flexShrink: "0" });
const bubbleClass = css({ fill: "accent.base" });
const checkClass = css({ stroke: "accent.fg" });

export interface MarkProps {
  /** px width/height (the mark is square) */
  size?: number;
  /** an accessible label; without one the mark is decorative (`aria-hidden`) */
  title?: string;
}

/** The mcplease mark on its own — a themeable speech-bubble with a "yes" check. */
export function Mark({ size = 28, title }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={markClass}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <rect x="3" y="3" width="26" height="19.5" rx="7.5" className={bubbleClass} />
      <path d="M9.6 21 L9.1 27.5 A0.55 0.55 0 0 0 10 27.9 L15.8 22 Z" className={bubbleClass} />
      <path
        d="M10.6 13.2 L14 16.7 L21.2 9.2"
        fill="none"
        strokeWidth={3.1}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={checkClass}
      />
    </svg>
  );
}

const wordmarkClass = css({
  fontFamily: "sans",
  fontWeight: "bold",
  letterSpacing: "wordmark",
  lineHeight: "[1]",
  color: "text.primary",
  whiteSpace: "nowrap",
});

const lockupClass = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "2",
});

export interface LogoProps {
  /** `lockup` (mark + wordmark), `mark` only, or `wordmark` only. */
  variant?: "lockup" | "wordmark" | "mark";
  /** Mark size in px; the wordmark scales to match. */
  size?: number;
  /** an accessible label; without one the logo is decorative (`aria-hidden`) */
  title?: string;
}

/**
 * The mcplease logo — the mark, the wordmark, or the locked-up pair. Use the lockup in headers and
 * footers and the bare mark for favicons, avatars, and tight spots. The wordmark is always the lowercase
 * single word, tracked tight — never "McPlease".
 */
export function Logo({ variant = "lockup", size = 28, title }: LogoProps) {
  if (variant === "mark") {
    return <Mark size={size} title={title} />;
  }

  const wordmark = (
    <span className={wordmarkClass} style={{ fontSize: `${Math.round(size * 0.92)}px` }}>
      mcplease
    </span>
  );

  if (variant === "wordmark") {
    return (
      <span
        role={title ? "img" : undefined}
        aria-label={title}
        aria-hidden={title ? undefined : true}
      >
        {wordmark}
      </span>
    );
  }

  return (
    <span
      className={lockupClass}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <Mark size={size} />
      {wordmark}
    </span>
  );
}

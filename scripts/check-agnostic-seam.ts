// The agnostic-seam rule: the @mcplease/theme core — tokens.ts,
// accents.ts, motion.ts — emits STRUCTURED values only. Every web CSS materialization
// (color-mix(), an accent var(), rgba(), px dimensions, the system-ui/sans-serif font
// stacks) belongs in the per-renderer binding (preset.ts for web), never in the core.
// This keeps "what a color is called" separate from "what a color is" a CHECKED contract,
// exactly like strictTokens — so a future session can't quietly reintroduce a wash string.
// CI runs this in the `checks` job.
//
// It scans LITERAL VALUES only (via the TS AST), not raw text — the core's own comments
// may name color-mix/rgba/px to explain the seam, and those are fine. A bare "px" unit label
// is data the renderer applies; only a concatenated dimension like 14px is a materialization.
// The pure scan is tested beside this.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import * as ts from "typescript";

/** The agnostic core — the files that must stay free of web CSS materialization. */
export const CORE_FILES = [
  "packages/theme/src/tokens.ts",
  "packages/theme/src/accents.ts",
  "packages/theme/src/motion.ts",
] as const;

/** Web-CSS materializations banned from the core. */
export const BANNED: ReadonlyArray<{ pattern: RegExp; label: string }> = [
  { pattern: /color-mix\(/, label: "color-mix()" },
  { pattern: /\bvar\(/, label: "var()" },
  { pattern: /rgba?\(/, label: "rgb()/rgba()" },
  { pattern: /\b\d+(?:\.\d+)?px\b/, label: "px dimension" },
  { pattern: /system-ui/, label: "system-ui font stack" },
  { pattern: /sans-serif/, label: "sans-serif font stack" },
];

export interface SourceFile {
  /** workspace-relative path with forward slashes */
  path: string;
  content: string;
}

/** Every string / template-literal value in a file, with its 1-based line.
 * Comments are not literals, so they're excluded by construction. */
export function literals(content: string): ReadonlyArray<{ text: string; line: number }> {
  const sf = ts.createSourceFile("scan.ts", content, ts.ScriptTarget.Latest, true);
  const out: { text: string; line: number }[] = [];
  const visit = (node: ts.Node): void => {
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node)
    ) {
      out.push({
        text: node.text,
        line: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1,
      });
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return out;
}

export function violations(files: ReadonlyArray<SourceFile>): string[] {
  const out: string[] = [];
  for (const file of files) {
    for (const { text, line } of literals(file.content)) {
      for (const { pattern, label } of BANNED) {
        if (pattern.test(text)) {
          out.push(
            `${file.path}:${line} — ${label} in a literal (materialize it in preset.ts, not the core)`,
          );
        }
      }
    }
  }
  return out.sort();
}

/* v8 ignore start — filesystem glue; the scan itself is tested above */
function main(): void {
  const root = process.cwd();
  const files: SourceFile[] = CORE_FILES.map((path) => ({
    path,
    content: readFileSync(join(root, path), "utf8"),
  }));
  const found = violations(files);
  if (found.length > 0) {
    console.error(
      "Agnostic-seam guard: the @mcplease/theme core must emit structured values only.\n",
    );
    for (const v of found) console.error(`  ${v}`);
    console.error(
      "\nMove the CSS materialization into packages/theme/src/preset.ts (the web binding).",
    );
    process.exit(1);
  }
  console.log(`agnostic seam: ${CORE_FILES.length} core files clean (no web CSS materialization).`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
/* v8 ignore stop */

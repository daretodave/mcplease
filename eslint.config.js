// The lint gate. Typed linting (strict-type-checked) via projectService; jsx-a11y because the share
// page must be reachable; no-restricted-imports encodes the two locks no typecheck catches — the sealed
// vendor (only @mcplease/data names Supabase) and the no-Context state law. Prettier owns formatting
// (eslint-config-prettier is last, so it never argues with lint).
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";
import checkFile from "eslint-plugin-check-file";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.wrangler/**", // wrangler's local build cache (minified worker bundle)
      "**/coverage/**",
      "**/styled-system/**", // Panda-generated
      "**/playwright-report/**",
      "**/test-results/**",
      "**/database.types.ts", // generated from the live schema
      "apps/web/public/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      // Numbers/booleans in template literals are fine; void arrow shorthand is idiomatic React.
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNumber: true, allowBoolean: true },
      ],
      "@typescript-eslint/no-confusing-void-expression": ["error", { ignoreArrowShorthand: true }],
    },
  },

  // Browser app — React hooks, fast-refresh, and a11y.
  // react-hooks' recommended-latest still ships a legacy string-array `plugins`,
  // so register the plugin as an object and take its rules directly.
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { "react-hooks": reactHooks },
    extends: [reactRefresh.configs.vite, jsxA11y.flatConfigs.recommended],
    rules: {
      ...reactHooks.configs["recommended-latest"].rules,
      // Belt-and-suspenders for the namespace form (the import ban covers `import { ... } from "react"`).
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "MemberExpression[object.name='React'][property.name=/^(createContext|useContext)$/]",
          message:
            "No React Context for app state — use a Zustand store in src/stores/ (read with a selector).",
        },
        {
          // The taxonomy is the law: every analytics push goes through @mcplease/analytics's typed
          // `track.*` (the only sanctioned path; the package is exempt). No raw dataLayer / gtag.
          selector: "MemberExpression[property.name='dataLayer']",
          message:
            "Don't touch window.dataLayer directly — fire typed events via @mcplease/analytics `track.*` (the only sanctioned push path; the event taxonomy is the law).",
        },
      ],
    },
  },

  // The sealed-vendor + no-@mcplease/ui locks, encoded where typecheck can't see them.
  // Only @mcplease/data may name the vendor, so it's exempt from the supabase ban.
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["packages/data/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@supabase/supabase-js",
              message:
                "IO goes through @mcplease/data's domain API — only @mcplease/data names the vendor (the seam law).",
            },
            {
              name: "react",
              importNames: ["createContext", "useContext"],
              message:
                "No React Context for app state — use a Zustand store in src/stores/ (read with a selector). Context is the re-render trap; Zustand is the escape hatch.",
            },
          ],
          patterns: [
            {
              group: ["@mcplease/ui", "@mcplease/ui/*"],
              message:
                "There is no @mcplease/ui. The design library is @mcplease/theme; components live in apps/web.",
            },
          ],
        },
      ],
    },
  },

  // Tests + E2E — relax the typed-lint rules that only punish test ergonomics
  // (mocks are inherently `any`-shaped; empty stub classes are fine).
  {
    files: ["**/*.test.{ts,tsx}", "apps/web/e2e/**/*.ts", "apps/web/test-setup.ts"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/no-confusing-void-expression": "off",
      "@typescript-eslint/no-extraneous-class": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
    },
  },

  // @mcplease/data is the sealed vendor boundary — supabase's loose/any-typed surface and its
  // string↔enum comparisons live ONLY here, by design. Everywhere else these stay errors.
  {
    files: ["packages/data/src/**/*.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-enum-comparison": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
    },
  },

  // Cloudflare Pages Functions (the edge) — workers-og (satori/resvg) and the Workers runtime are
  // loosely typed, so relax the unsafe-* rules exactly like the sealed data layer; these run in the
  // Workers global scope, not the browser.
  {
    files: ["apps/web/functions/**/*.ts"],
    languageOptions: { globals: { ...globals.worker } },
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
    },
  },

  // Config + plain-JS files aren't in a tsconfig project — no type-aware linting,
  // and they run in Node (module.exports / require / process).
  {
    files: ["**/*.{js,cjs,mjs}", "**/*.config.{ts,mts}"],
    languageOptions: { globals: { ...globals.node } },
    extends: [tseslint.configs.disableTypeChecked],
  },

  // Names are kebab-case (the-name, never theName or the_name) — folders and files alike, linted
  // not reviewed. Conventional root files (App.tsx, main.tsx) sit directly in src/ so they fall
  // outside the subfolder glob and stay exempt; config files aren't matched.
  {
    files: ["apps/web/src/**/*.{ts,tsx}", "packages/*/src/**/*.{ts,tsx}", "scripts/**/*.{ts,tsx}"],
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        {
          "apps/web/src/**/*/*.{ts,tsx}": "KEBAB_CASE",
          "packages/*/src/**/*.{ts,tsx}": "KEBAB_CASE",
          "scripts/**/*.{ts,tsx}": "KEBAB_CASE",
        },
        { ignoreMiddleExtensions: true },
      ],
      "check-file/folder-naming-convention": [
        "error",
        {
          "apps/web/src/**/": "KEBAB_CASE",
          "packages/*/src/**/": "KEBAB_CASE",
        },
      ],
    },
  },

  prettier,
);

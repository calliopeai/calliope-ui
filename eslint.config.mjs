import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import storybook from "eslint-plugin-storybook";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * Design-token guardrail, ported from Astrolift (`astrolift/no-raw-design-values`).
 * Class strings use tokens: no raw hex, rgb() or hsl(), no `text-[Npx]`,
 * no `rounded-[Npx]`, no Tailwind palette colours, no arbitrary px or rem
 * spacing. Arbitrary values that reference a token (`bg-(--x)`,
 * `p-(--panel-pad)`, `max(...)`) are fine. A swatch that must show an exact
 * colour sets it through `style`, which this rule does not read.
 */
const HEX = /#[0-9a-fA-F]{3,8}\b/;
const COLOR_FN = /\b(?:rgb|rgba|hsl|hsla|oklch)\(/;
const TEXT_SIZE = /(?<![\w-])text-\[[0-9.]+px\]/;
const ROUND_SIZE = /(?<![\w-])rounded-\[[0-9.]+px\]/;
const RAW_PALETTE =
  /(?<![\w-])(?:[a-z-]+:)*(?:bg|text|border|ring|fill|stroke|from|to|via|outline|divide|shadow|decoration|accent|caret)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d{2,3}\b/;
const ARBITRARY_SPACING =
  /(?<![\w-])-?(?:p|px|py|pt|pb|pl|pr|ps|pe|m|mx|my|mt|mb|ml|mr|ms|me|gap|gap-x|gap-y|space-x|space-y)-\[[0-9.]+(?:px|rem)\]/;
const CLASS_HELPERS = new Set(["cn", "cva", "clsx"]);

const designTokens = {
  meta: {
    type: "problem",
    docs: { description: "Class strings use design tokens, not raw values." },
    messages: {
      hex: "Raw hex colour in a class string. Use a token (bg-primary, text-success-fg, border-danger-border).",
      colorFn: "Raw colour function in a class string. Use a token.",
      textSize: "Arbitrary text-[Npx]. Use the type scale (text-2xs to text-2xl).",
      roundSize: "Arbitrary rounded-[Npx]. Use rounded-lg (the corners setting) or rounded-full.",
      palette: "Tailwind palette colour. Use a semantic token so themes and status stay correct.",
      spacing: "Arbitrary px or rem spacing. Use the spacing scale or a density token.",
    },
    schema: [],
  },
  create(context) {
    const source = context.sourceCode;
    const check = (node, text) => {
      if (HEX.test(text)) context.report({ node, messageId: "hex" });
      if (COLOR_FN.test(text)) context.report({ node, messageId: "colorFn" });
      if (TEXT_SIZE.test(text)) context.report({ node, messageId: "textSize" });
      if (ROUND_SIZE.test(text)) context.report({ node, messageId: "roundSize" });
      if (ARBITRARY_SPACING.test(text)) context.report({ node, messageId: "spacing" });
      if (RAW_PALETTE.test(text)) context.report({ node, messageId: "palette" });
    };
    return {
      JSXAttribute(node) {
        if (node.name?.name === "className" && node.value) check(node, source.getText(node.value));
      },
      CallExpression(node) {
        if (node.callee.type === "Identifier" && CLASS_HELPERS.has(node.callee.name)) {
          check(node, source.getText(node));
        }
      },
    };
  },
};

/**
 * The package ships plain ESM that bundlers and Node resolve strictly, so a
 * relative import names its file: `./Button.js`, never `./Button`.
 */
const relativeImportExtension = {
  meta: {
    type: "problem",
    docs: { description: "Relative imports end in .js." },
    messages: { extension: "Relative import `{{source}}` needs its .js extension." },
    schema: [],
  },
  create(context) {
    const checkSource = (node) => {
      const value = node.source?.value;
      if (typeof value === "string" && value.startsWith(".") && !/\.(js|css|json)$/.test(value)) {
        context.report({ node: node.source, messageId: "extension", data: { source: value } });
      }
    };
    return {
      ImportDeclaration: checkSource,
      ExportNamedDeclaration: checkSource,
      ExportAllDeclaration: checkSource,
    };
  },
};

const calliope = {
  rules: { "design-tokens": designTokens, "relative-import-extension": relativeImportExtension },
};

export default tseslint.config(
  { ignores: ["dist/", "storybook-static/", "coverage/", "node_modules/"] },
  js.configs.recommended,
  tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  storybook.configs["flat/recommended"],
  {
    languageOptions: { globals: { ...globals.browser } },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  {
    files: ["scripts/**", "*.config.{js,mjs,ts}", ".storybook/main.ts"],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { calliope },
    rules: {
      "calliope/design-tokens": "error",
      "calliope/relative-import-extension": "error",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["next", "next/*"],
              message:
                "The package works in any React app: take a link component from UIProvider instead of next/link, and props instead of next/navigation.",
            },
            {
              group: ["radix-ui", "radix-ui/*", "@radix-ui/*"],
              message:
                "Radix is wrapped once, in src/primitives and src/overlays. Import the wrapper.",
            },
          ],
        },
      ],
    },
  },
  {
    // The wrappers themselves.
    files: ["src/primitives/**/*.{ts,tsx}", "src/overlays/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["next", "next/*"],
              message: "The package works in any React app; no Next-only APIs.",
            },
          ],
        },
      ],
    },
  },
  prettier
);

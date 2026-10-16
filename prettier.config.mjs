/** @type {import("prettier").Config} */
const config = {
  semi: true,
  singleQuote: false,
  trailingComma: "es5",
  printWidth: 100,
  tabWidth: 2,
  plugins: ["prettier-plugin-tailwindcss"],
  // Tailwind 4 reads its theme from CSS: the Storybook stylesheet imports
  // Tailwind and this package's preset, so class sorting knows every token.
  tailwindStylesheet: "./.storybook/storybook.css",
  tailwindFunctions: ["cn", "cva"],
};

export default config;

/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-standard", "stylelint-config-tailwindcss"],
  overrides: [
    {
      customSyntax: "postcss-styled-syntax",
      files: ["**/*.{ts,tsx}"],
    },
  ],
  plugins: ["stylelint-order"],
  rules: {
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "tailwind",
          "apply",
          "variants",
          "responsive",
          "screen",
        ],
      },
    ],
    "block-no-empty": true,
    "order/order": ["custom-properties", "declarations"],
    "order/properties-alphabetical-order": true,
    "order/properties-order": ["width", "height"],
  },
};

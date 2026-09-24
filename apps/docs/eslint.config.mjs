import reactNativeWcandillon from "eslint-config-react-native-wcandillon";

export default [
  ...reactNativeWcandillon,
  {
    ignores: ["node_modules/**", ".next/**", "out/**", ".source/**", "next-env.d.ts"],
  },
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs}"],
    rules: {
      "prefer-destructuring": [
        "error",
        {
          object: true,
          array: false,
        },
      ],
      "no-bitwise": "off",
      "no-var": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-empty-function": "off",
    },
  },
  {
    // Next.js, config files, and the examples (written like app code) use
    // default exports.
    files: [
      "app/**/*.{ts,tsx}",
      "*.config.{ts,mjs}",
      "src/components/search.tsx",
      "src/examples/**/*.tsx",
    ],
    rules: {
      "import/no-default-export": "off",
    },
  },
];

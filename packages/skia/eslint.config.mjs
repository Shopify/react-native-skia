// eslint.config.js
import wcandillon from "eslint-config-react-native-wcandillon";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  {
    ignores: ["lib/**", "dist/**", "node_modules/**", "*.config.js", "jest.config.js", "*.mjs"]
  },
  ...wcandillon,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
      }
    },
    rules: {
      "prefer-destructuring": [
        "error",
        {
          "object": true,
          "array": false
        }
      ],
      "no-bitwise": "off",
      "no-var": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-empty-function": "off",
      "react-hooks/exhaustive-deps": [
        "error",
        {
          "additionalHooks": "(useFrame)"
        }
      ],
      "import/extensions": "off"
    }
  },
  {
    files: ["*.{js,jsx}", "scripts/**/*.js"],
    plugins: {
      "react-hooks": reactHooks
    },
    rules: {
      "prefer-destructuring": [
        "error",
        {
          "object": true,
          "array": false
        }
      ],
      "no-bitwise": "off",
      "no-var": "off",
      "react-hooks/exhaustive-deps": [
        "error",
        {
          "additionalHooks": "(useFrame)"
        }
      ],
      "import/extensions": "off"
    }
  }
];
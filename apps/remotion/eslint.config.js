// eslint.config.js
import wcandillon from "eslint-config-react-native-wcandillon";

export default [
  {
    ignores: ["node_modules/**", "dist/**", "*.config.js", "jest.config.js", "*.mjs", "out/**"]
  },
  ...wcandillon,
  {
    files: ["src/**/*.{ts,tsx}", "*.{ts,tsx}"],
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
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-var-requires": "off",
      "import/extensions": [
        "error",
        {
          "pattern": {
            "sksl": "always"
          }
        }
      ]
    }
  },
  {
    files: ["*.{js,jsx}"],
    rules: {
      "prefer-destructuring": [
        "error",
        {
          "object": true,
          "array": false
        }
      ],
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-var-requires": "off",
      "import/extensions": [
        "error",
        {
          "pattern": {
            "sksl": "always"
          }
        }
      ]
    }
  }
];
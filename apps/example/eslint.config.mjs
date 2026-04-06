// eslint.config.js
import wcandillon from "eslint-config-react-native-wcandillon";

export default [
  {
    ignores: ["node_modules/**", "dist/**", "*.config.js", "jest.config.js", "*.mjs", "android/**", "ios/**", "macos/**"]
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
      "max-len": "off",
      "no-bitwise": "off",
      "no-var": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-empty-function": "off",
      "react/jsx-uses-react": "error",
      "react/react-in-jsx-scope": "error",
      "reanimated/js-function-in-worklet": 0,
      "import/no-cycle": [2, { "ignoreExternal": true, "disableScc": true }],
      "import/extensions": "off"
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
      "max-len": "off",
      "no-bitwise": "off",
      "no-var": "off",
      "react/jsx-uses-react": "error",
      "react/react-in-jsx-scope": "error",
      "import/no-cycle": [2, { "ignoreExternal": true, "disableScc": true }],
      "import/extensions": "off"
    }
  }
];
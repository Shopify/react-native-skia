const config = {
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapper: {
    "^.+.(css|styl|less|sass|scss|png|jpg|ttf|otf|woff|woff2)$":
      "jest-transform-stub",
    "^react-native$": "<rootDir>/../../node_modules/react-native",
  },
  modulePathIgnorePatterns: ["<rootDir>/lib/typescript", "setup.(ts|tsx)$"],
  testEnvironment: "@shopify/react-native-skia/jestEnv.js",
  setupFilesAfterEnv: [
    "@shopify/react-native-skia/jestSetup.js",
    "<rootDir>/../../node_modules/react-native-gesture-handler/jestSetup.js",
    "<rootDir>/jestSetup.js",
  ],
  preset: "react-native",
  transformIgnorePatterns: [
    "node_modules/(?!(@react-native|react-native|react-native.*|@?react-navigation.*)/)",
  ],
};

export default config;

const coreConfig = require("./jest.config");
module.exports = {
  ...coreConfig,
  testMatch: [
    "**/__tests__/**/*.common.?([mc])[jt]s?(x)",
    "**/?(*.)+(spec|test).common.?([mc])[jt]s?(x)",
  ],
  setupFiles: ["@shopify/react-native-skia/jestSetup.js"],
  setupFilesAfterEnv: [
    "<rootDir>/../../node_modules/react-native-gesture-handler/jestSetup.js",
    "<rootDir>/jestSetup.js",
  ],
};

const coreConfig = require("./jest.config");

module.exports = {
  ...coreConfig,
  setupFilesAfterEnv: [
    "@shopify/react-native-skia/jestSetup.mjs",
    "<rootDir>/../../node_modules/react-native-gesture-handler/jestSetup.js",
    "<rootDir>/jestSetup.js",
  ],
};

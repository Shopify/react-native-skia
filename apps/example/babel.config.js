module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: [
    "transform-inline-environment-variables",
    "react-native-worklets/plugin",
  ],
};

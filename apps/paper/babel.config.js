module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  plugins: [
    "transform-inline-environment-variables",
    "react-native-reanimated/plugin",
    "@babel/plugin-transform-runtime",
  ],
};

module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: [
    ["babel-plugin-react-compiler", { target: "19" }],
    "transform-inline-environment-variables",
    "@babel/plugin-proposal-explicit-resource-management",
    "react-native-reanimated/plugin",
  ],
};

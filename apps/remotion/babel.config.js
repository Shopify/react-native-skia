const config = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    "@babel/preset-typescript"
  ],
  plugins: [
    "@babel/plugin-transform-flow-strip-types"
  ]
};

export default config;

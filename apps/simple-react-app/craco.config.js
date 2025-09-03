const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const path = require("path");

module.exports = {
  webpack: {
    plugins: {
      add: [new NodePolyfillPlugin()]
    },
    configure: (webpackConfig) => {
      // Remove the ModuleScopePlugin which restricts imports to src/
      webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
        plugin => plugin.constructor.name !== 'ModuleScopePlugin'
      );

      // Find and update the babel-loader rule to include workspace packages
      const babelRule = webpackConfig.module.rules.find(rule =>
        rule.oneOf && Array.isArray(rule.oneOf)
      );
      
      if (babelRule) {
        const jsRule = babelRule.oneOf.find(rule =>
          rule.test && rule.test.toString().includes('jsx')
        );
        
        if (jsRule) {
          // Extend the JS/JSX rule to include workspace packages
          jsRule.include = [
            jsRule.include,
            path.resolve(__dirname, "../../packages/skia/src")
          ].filter(Boolean);
        }
      }

      // Add aliases for React Native modules
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        "react-native$": "react-native-web",
        "react-native-reanimated": "react-native-reanimated/lib/module/web",
        "react-native/Libraries/Image/AssetRegistry": "react-native-web/dist/modules/AssetRegistry",
        "@shopify/react-native-skia$": path.resolve(__dirname, "../../packages/skia/src/index.ts"),
        "@shopify/react-native-skia/src/web": path.resolve(__dirname, "../../packages/skia/src/web/index.ts")
      };

      // Ensure canvaskit.wasm is accessible
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        fs: false,
        path: require.resolve("path-browserify"),
      };

      return webpackConfig;
    }
  }
};
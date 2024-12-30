import { Config } from "@remotion/cli/config";
import CopyPlugin from "copy-webpack-plugin";

Config.setOverwriteOutput(true);
Config.setVideoImageFormat("png");
Config.setPixelFormat("yuva444p10le");
Config.setCodec("prores");
Config.setProResProfile("4444");

//Config.setProResProfile("4444");
//Config.setFrameRange([140, 244]);

Config.overrideWebpackConfig((currentConfiguration) => {
  if (!currentConfiguration.module) {
    currentConfiguration.module = {};
  }
  if (!currentConfiguration.module.rules) {
    currentConfiguration.module.rules = [];
  }
  currentConfiguration.module.rules.push({
    test: /\.js$/,
    exclude: /node_modules\/(?!@react-native)/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-flow'],
        plugins: ['@babel/plugin-transform-flow-strip-types']
      }
    }
  });
  currentConfiguration.plugins!.push(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    new CopyPlugin({
      patterns: [
        { from: "../../node_modules/canvaskit-wasm/bin/full/canvaskit.wasm" },
      ],
    })
  );
  return {
    ...currentConfiguration,
    resolve: {
      ...currentConfiguration.resolve,
      fallback: {
        fs: false,
        path: false,
        buffer: require.resolve("buffer/"),
        "react-native/Libraries/Image/AssetRegistry": false,
      },
      extensions: [
        ".web.js",
        ".web.ts",
        ".web.tsx",
        ".js",
        ".ts",
        ".tsx",
        ".sksl",
        "...",
      ],
    },
    externals: {
      "react-native-reanimated": "require('react-native-reanimated')",
      "react-native-reanimated/package.json":
        "require('react-native-reanimated/package.json')",
    },
  };
});

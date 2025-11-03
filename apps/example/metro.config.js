const path = require("path");
const { makeMetroConfig } = require("@rnx-kit/metro-config");

const metroConfig = makeMetroConfig({
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
});

const resolver = (metroConfig.resolver = metroConfig.resolver ?? {});

resolver.platforms = Array.from(
  new Set([...(resolver.platforms ?? []), "web"]),
);

const webSourceExts = [
  "web.tsx",
  "web.ts",
  "web.jsx",
  "web.js",
  "web.mjs",
  "web.cjs",
];
resolver.sourceExts = Array.from(
  new Set([...(resolver.sourceExts ?? []), ...webSourceExts]),
);

if (process.env.IS_WEB_BUILD) {
  const reactNativeWebPath = path.dirname(
    require.resolve("react-native-web/package.json"),
  );

  resolver.extraNodeModules = {
    ...(resolver.extraNodeModules ?? {}),
    "react-native": path.join(reactNativeWebPath, "dist", "index.js"),
  };

  metroConfig.transformer = {
    ...(metroConfig.transformer ?? {}),
    assetRegistryPath: path.join(
      reactNativeWebPath,
      "dist",
      "modules",
      "AssetRegistry",
      "index.js",
    ),
  };
}

module.exports = metroConfig;

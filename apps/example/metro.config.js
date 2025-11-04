const path = require("path");
const { resolve: defaultResolve } = require("metro-resolver");
const { makeMetroConfig } = require("@rnx-kit/metro-config");

const root = path.resolve(__dirname, "../..");
const rnwPath = path.resolve(root, "node_modules/react-native-web");
const assetRegistryPath = path.resolve(
  root,
  "node_modules/react-native-web/dist/modules/AssetRegistry/index",
);

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

function getWebMetroConfig(config) {
  config.resolver = config.resolver ?? {};
  config.resolver.platforms = ["ios", "android", "web"];

  const origResolveRequest =
    config.resolver.resolveRequest ??
    ((context, moduleName, platform) =>
      defaultResolve(context, moduleName, platform));

  config.resolver.resolveRequest = (contextRaw, moduleName, platform) => {
    const context = {
      ...contextRaw,
      preferNativePlatform: false,
    };

    if (moduleName === "react-native") {
      return {
        filePath: path.resolve(rnwPath, "dist/index.js"),
        type: "sourceFile",
      };
    }

    // Let default config handle other modules
    return origResolveRequest(context, moduleName, platform);
  };

  config.transformer = config.transformer ?? {};
  config.transformer.assetRegistryPath = assetRegistryPath;

  return config;
}

module.exports = !!process.env.IS_WEB_BUILD
  ? getWebMetroConfig(metroConfig)
  : metroConfig;

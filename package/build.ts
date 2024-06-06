// Execute this file with `bun build.ts`

// Generates two files:
// `@Shopify/react-native-skia/web` -> `lib/web/pure.js`
// -> A version of RN Skia that has no React Native dependency
//    and therefore no Webpack override is necessary
// `@Shopify/react-native-skia/react-native-web` -> lib/web/react-native-web.js
// -> A version of RN Skia for the web that has a React Native dependency
//    that can be overriden with Webpack in order to support React Native-style assets

import { build, BunPlugin } from "bun";
import pathModule from "path";

if (process.env.NODE_ENV !== "production") {
  throw new Error("This script needs to be run with NODE_ENV=production.");
}

export const bundleSkia = async (
  noReactNativeDependency: boolean,
  output: string
) => {
  const reactNativePlugin: BunPlugin = {
    name: "Resolve .web.ts first",
    setup(build) {
      build.onResolve(
        { filter: /.*/ },
        async ({ importer, namespace, path }) => {
          // If there should be no react-native dependency,
          // override it with a no-dependency version
          if (noReactNativeDependency) {
            path = path.replace(
              "ResolveAssetWithRNDependency",
              "ResolveAssetWithNoDependency"
            );
            path = path.replace("ReanimatedProxy", "ReanimatedProxyPure");
            path = path.replace("reanimatedStatus", "reanimatedStatusPure");
          }
          const resolved = pathModule.resolve(importer, "..", path);

          // First resolve web.ts
          const extensions = [".web.ts", ".web.tsx", ".ts", ".tsx"];
          const resolvedWithExtensions = extensions.map(
            (ext) => resolved + ext
          );

          // Override with .web.tsx if it exists
          for (const resolvedWithExtension of resolvedWithExtensions) {
            if (await Bun.file(resolvedWithExtension).exists()) {
              return Promise.resolve({
                namespace,
                path: resolvedWithExtension,
              });
            }
          }
          return undefined;
        }
      );
    },
  };

  const outputs = await build({
    plugins: [reactNativePlugin],
    entrypoints: ["./src/web/for-bundling.ts"],
    // Don't bundle these dependencies
    external: [
      "react-native",
      "canvaskit-wasm",
      "react",
      "scheduler",
      "react-reconciler",
      "react-native-reanimated",
    ],
  });

  if (!outputs.success) {
    console.error(outputs.logs);
    throw new Error("Build failed");
  }
  return outputs.outputs[0].text();
};

const PURE_VERSION = "lib/web/pure.js";
const REACT_NATIVE_WEB_VERSION = "lib/web/react-native-web.js";

// 1. Bundle a pure version with no React Native dependencies
const pureVersion = await bundleSkia(true, PURE_VERSION);
await Bun.write(PURE_VERSION, pureVersion);
// Test pure version: Should not import React Native dependencies
// or react-native-reanimated
if (
  pureVersion.includes(`__require("react-native`) ||
  pureVersion.includes(`from "react-native`)
) {
  throw new Error("Pure version should not include React Native dependencies");
}

// 2. Bundle a version with React Native dependencies
const rnwVersion = await bundleSkia(false, REACT_NATIVE_WEB_VERSION);
// Test RNW version: Should import React Native dependencies
await Bun.write(REACT_NATIVE_WEB_VERSION, rnwVersion);

// 3. Map the types to the correct files
await Bun.write(
  "lib/web/pure.d.ts",
  'export * from "../typescript/src/web/for-bundling";'
);
await Bun.write(
  "lib/web/react-native-web.d.ts",
  'export * from "../typescript/src/web/for-bundling";'
);

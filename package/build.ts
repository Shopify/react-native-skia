import { build, BunPlugin } from "bun";
import pathModule from "path";

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
          // Don't resolve the file with the RN dependency if building for web
          if (noReactNativeDependency) {
            path = path.replace(
              /ResolveAssetWithRNDependency/,
              "ResolveAssetWithNoDependency"
            );
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
    entrypoints: ["./src/index.ts"],
    // Don't bundle these dependencies
    external: [
      "react-native",
      "canvaskit-wasm",
      "react",
      "scheduler",
      "react-reconciler",
    ],
  });

  if (!outputs.success) {
    console.error(outputs.logs);
    throw new Error("Build failed");
  }
  const bundled = outputs.outputs[0];
  Bun.write(output, await bundled.text());
};

const bundleSkiaWeb = async () => {
  const outputs = await build({
    entrypoints: ["./src/web/index.ts"],
    // Don't bundle these dependencies
    external: [
      "react-native",
      "canvaskit-wasm",
      "react",
      "scheduler",
      "react-reconciler",
    ],
  });
  if (!outputs.success) {
    console.error(outputs.logs);
    throw new Error("Build failed");
  }
  const bundled = outputs.outputs[0];
  Bun.write("webindex.js", await bundled.text());
};

await bundleSkia(true, "web.js");
await bundleSkia(false, "react-native-web.js");
await bundleSkiaWeb();

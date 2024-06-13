import path from "path";

import { build, BunPlugin } from "bun";

const outputs = await build({
  plugins: [],
  entrypoints: ["./src/web/web-bundle.ts"],
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

const text = await outputs.outputs[0].text();

console.log({ text });

// Copies the CanvasKit WebAssembly binary into public/ so the live examples
// can load it at runtime (see src/components/live/LiveExample.tsx).
import { copyFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const src = join(
  dirname(require.resolve("canvaskit-wasm/package.json")),
  "bin/full/canvaskit.wasm"
);
const dst = join(dirname(fileURLToPath(import.meta.url)), "../public/canvaskit.wasm");
copyFileSync(src, dst);

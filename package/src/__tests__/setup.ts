import path from "path";
import fs from "fs";

import type { Surface } from "canvaskit-wasm";

import type { SkSurface } from "../skia";
import { toValue } from "../skia/web/Host";

export const processResult = (
  surface: SkSurface,
  relPath: string,
  overwrite = false
) => {
  toValue<Surface>(surface).flush();
  const image = surface.makeImageSnapshot();
  const png = image.encodeToBytes();
  const p = path.resolve(__dirname, relPath);
  if (fs.existsSync(p) && !overwrite) {
    const ref = fs.readFileSync(p);
    expect(ref.equals(png)).toBe(true);
  } else {
    fs.writeFileSync(p, png);
  }
};

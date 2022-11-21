import path from "path";
import fs from "fs";

import type { Surface } from "canvaskit-wasm";

import type { SkSurface, SkImage } from "../skia/types";
import { JsiSkSurface } from "../skia/web/JsiSkSurface";

export const docPath = (relPath: string) =>
  path.resolve(process.cwd(), `../docs/static/img/${relPath}`);

export const processResult = (
  surface: SkSurface,
  relPath: string,
  overwrite = false
) => {
  const ckSurface = JsiSkSurface.fromValue<Surface>(surface);
  ckSurface.flush();
  const image = surface.makeImageSnapshot();
  const png = image.encodeToBytes();
  const p = path.resolve(__dirname, relPath);
  if (fs.existsSync(p) && !overwrite) {
    const ref = fs.readFileSync(p);
    expect(ref.equals(png)).toBe(true);
  } else {
    fs.writeFileSync(p, png);
  }
  ckSurface.getCanvas().clear(Float32Array.of(0, 0, 0, 0));
};

export const checkImage = (
  image: SkImage,
  relPath: string,
  overwrite = false
) => {
  const png = image.encodeToBytes();
  const p = path.resolve(__dirname, relPath);
  if (fs.existsSync(p) && !overwrite) {
    const ref = fs.readFileSync(p);
    expect(ref.equals(png)).toBe(true);
  } else {
    fs.writeFileSync(p, png);
  }
};

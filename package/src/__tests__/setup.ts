import path from "path";
import fs from "fs";

import type { Surface, SkPicture as Picture } from "canvaskit-wasm";

import type { SkSurface, SkPicture } from "../skia/types";
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

export const savePicture = (
  picture: SkPicture,
  relPath: string,
  overwrite = false
) => {
  const skp = toValue<Picture>(picture).serialize()!;
  expect(skp).toBeTruthy();
  const p = path.resolve(__dirname, relPath);
  if (fs.existsSync(p) && !overwrite) {
    const ref = fs.readFileSync(p);
    expect(ref.equals(skp)).toBe(true);
  } else {
    fs.writeFileSync(p, skp);
  }
};

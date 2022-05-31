import fs from "fs";
import path from "path";

import type { Surface } from "canvaskit-wasm";
import CanvasKitInit from "canvaskit-wasm";

import { Skia } from "../types";
import type { SkSurface } from "../types";
import { toValue } from "../web/api/Host";
import { JsiSkApi } from "../web";

let Skia: ReturnType<typeof JsiSkApi>;

beforeAll(async () => {
  const CanvasKit = await CanvasKitInit();
  Skia = JsiSkApi(CanvasKit);
});

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
    const ref = fs.readFileSync(path.resolve(__dirname, relPath));
    expect(ref.equals(png)).toBe(true);
  } else {
    fs.writeFileSync(p, png);
  }
};

const width = 256;
const height = 256;

export const setupSkia = () => {
  expect(Skia).toBeDefined();
  const surface = Skia.Surface.Make(width, height)!;
  expect(surface).toBeDefined();
  const canvas = surface.getCanvas();
  expect(canvas).toBeDefined();
  return {
    surface,
    width,
    height,
    center: { x: width / 2, y: height / 2 },
    canvas,
    Skia,
  };
};

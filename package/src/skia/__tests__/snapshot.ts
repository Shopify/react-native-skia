import fs from "fs";
import path from "path";

import type { Surface } from "canvaskit-wasm";

import type { Skia, SkSurface } from "../types";
import { toValue } from "../web/api/Host";

export const processResult = (surface: SkSurface, relPath: string) => {
  toValue<Surface>(surface).flush();
  const image = surface.makeImageSnapshot();
  const png = image.encodeToBytes();
  const p = path.resolve(__dirname, relPath);
  if (fs.existsSync(p)) {
    const ref = fs.readFileSync(path.resolve(__dirname, relPath));
    expect(ref.equals(png)).toBe(true);
  } else {
    fs.writeFileSync(p, png);
  }
};

const width = 256;
const height = 256;

export const makeSurface = (Skia: Skia) => {
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
  };
};

import { JsiSkDOM } from "../../dom/nodes";
import type { SkDOM } from "../../dom/types";
import { LoadSkiaWeb } from "../../web/LoadSkiaWeb";
import { Skia } from "../types";
import { JsiSkApi } from "../web";

let Skia: ReturnType<typeof JsiSkApi>;
let Sk: SkDOM;

declare global {
  var Sk: SkDOM;
}

beforeAll(async () => {
  await LoadSkiaWeb();
  Skia = JsiSkApi(global.CanvasKit);
  Sk = new JsiSkDOM(Skia);
});

export const setupSkia = (width = 256, height = 256) => {
  expect(Skia).toBeDefined();
  const surface = Skia.Surface.Make(width, height)!;
  expect(surface).toBeDefined();
  const canvas = surface.getCanvas();
  expect(canvas).toBeDefined();
  expect(Sk).toBeDefined();
  return {
    surface,
    width,
    height,
    center: { x: width / 2, y: height / 2 },
    canvas,
    Skia,
    CanvasKit: global.CanvasKit,
  };
};

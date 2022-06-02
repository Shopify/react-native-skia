import { Buffer } from "buffer";

import CanvasKitInit from "canvaskit-wasm";

import { Skia } from "../types";
import { JsiSkApi } from "../web";

let Skia: ReturnType<typeof JsiSkApi>;

beforeAll(async () => {
  const CanvasKit = await CanvasKitInit();
  Skia = JsiSkApi(CanvasKit);
  // We use this for this for the FontMgr polyfill
  global.atob = (str: string) => Buffer.from(str, "base64").toString("binary");
});

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

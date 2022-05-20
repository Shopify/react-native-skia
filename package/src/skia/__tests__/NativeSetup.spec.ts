import type { CanvasKit } from "canvaskit-wasm";
import CanvasKitInit from "canvaskit-wasm";

import type { SkiaApi } from "../SkiaApi";

let Skia: SkiaApi;

declare global {
  var CanvasKit: CanvasKit;
}

beforeAll(async () => {
  global.CanvasKit = await CanvasKitInit();
  // eslint-disable-next-line prefer-destructuring
  Skia = require("../Skia.web").Skia;
});

describe("NativeSetup", () => {
  it("Check that CanvasKit and CanvasKit are loaded", () => {
    expect(global.CanvasKit).toBeDefined();
    expect(Skia).toBeDefined();
  });
  it("Can create a CPU backed surface", () => {
    const surface = global.CanvasKit.MakeSurface(256, 256);
    expect(surface).toBeDefined();
    if (!surface) {
      return;
    }
    const canvas = surface.getCanvas();
  });
});

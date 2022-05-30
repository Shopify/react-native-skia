import fs from "fs";
import path from "path";

import type { Surface } from "canvaskit-wasm";
import CanvasKitInit from "canvaskit-wasm";

import { JsiSkApi } from "../web";
import { toValue } from "../web/api/Host";

//import type { SkiaApi } from "../SkiaApi";

let Skia: ReturnType<typeof JsiSkApi>;

beforeAll(async () => {
  const CanvasKit = await CanvasKitInit();
  Skia = JsiSkApi(CanvasKit);
});

describe("Draw a rectangle", () => {
  it("Check that CanvasKit and CanvasKit are loaded", async () => {
    expect(Skia).toBeDefined();
  });
  it("Draws a lightblue rectange", () => {
    const paint = Skia.Paint();
    paint.setColor(Skia.Color("lightblue"));
    const rct = Skia.XYWHRect(64, 64, 128, 128);
    const surface = Skia.Surface.Make(256, 256);
    expect(surface).toBeDefined();
    if (!surface) {
      return;
    }
    const canvas = surface.getCanvas();
    canvas.drawRect(rct, paint);
    toValue<Surface>(surface).flush();
    const image = surface.makeImageSnapshot();
    const png = image.encodeToBytes();
    const ref = fs.readFileSync(
      path.resolve(__dirname, "snapshots/lightblue-rect.png")
    );
    expect(ref.equals(png)).toBe(true);
  });
});

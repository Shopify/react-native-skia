import CanvasKitInit from "canvaskit-wasm";

import { TileMode } from "../types";
import { JsiSkApi } from "../web";

import { processResult, makeSurface } from "./snapshot";

let Skia: ReturnType<typeof JsiSkApi>;

beforeAll(async () => {
  const CanvasKit = await CanvasKitInit();
  Skia = JsiSkApi(CanvasKit);
});

describe("ImageFilter", () => {
  it("Check that CanvasKit and CanvasKit are loaded", async () => {
    expect(Skia).toBeDefined();
  });

  it("Image Filter", () => {
    const { surface, canvas, width } = makeSurface(Skia);
    const r = width / 2;
    const paint = Skia.Paint();
    paint.setAntiAlias(true);
    paint.setColor(Skia.Color("lightblue"));
    paint.setImageFilter(
      Skia.ImageFilter.MakeBlur(40, 40, TileMode.Clamp, null)
    );
    canvas.drawCircle(r, r, r, paint);
    processResult(surface, "snapshots/image-filter/blur.png", true);
  });
});

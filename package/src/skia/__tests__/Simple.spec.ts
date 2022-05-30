import CanvasKitInit from "canvaskit-wasm";

import { JsiSkApi } from "../web";
import { BlendMode } from "../types";

import { processResult, makeSurface } from "./snapshot";

let Skia: ReturnType<typeof JsiSkApi>;
const width = 256;
const height = 256;

beforeAll(async () => {
  const CanvasKit = await CanvasKitInit();
  Skia = JsiSkApi(CanvasKit);
});

describe("Draw a rectangle", () => {
  it("Check that CanvasKit and CanvasKit are loaded", async () => {
    expect(Skia).toBeDefined();
  });
  it("Draws a lightblue rectange", () => {
    const { surface, canvas } = makeSurface(Skia);
    const paint = Skia.Paint();
    paint.setColor(Skia.Color("lightblue"));
    const rct = Skia.XYWHRect(64, 64, 128, 128);
    canvas.drawRect(rct, paint);
    processResult(surface, "snapshots/lightblue-rect.png");
  });
});

describe("Test blend modes", () => {
  it("Test multiply blend mode", () => {
    const { surface, canvas } = makeSurface(Skia);
    const r = 100;

    const paint = Skia.Paint();
    paint.setAntiAlias(true);
    paint.setBlendMode(BlendMode.Multiply);

    const cyan = paint.copy();
    cyan.setColor(Skia.Color("cyan"));
    canvas.drawCircle(r, r, r, cyan);
    // Magenta Circle
    const magenta = paint.copy();
    magenta.setColor(Skia.Color("magenta"));
    canvas.drawCircle(width - r, r, r, magenta);
    // Yellow Circle
    const yellow = paint.copy();
    yellow.setColor(Skia.Color("yellow"));
    canvas.drawCircle(width / 2, height - r, r, yellow);

    processResult(surface, "snapshots/blend-modes.png");
  });
});

describe("Test Circle", () => {
  it("Draw a circle", () => {
    const { surface, canvas } = makeSurface(Skia);

    const r = 128;

    const paint = Skia.Paint();
    paint.setAntiAlias(true);

    paint.setColor(Skia.Color("cyan"));
    canvas.drawCircle(r, r, r, paint);

    processResult(surface, "snapshots/cyan-circle.png");
  });
});

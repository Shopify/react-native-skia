import fs from "fs";
import path from "path";

import CanvasKitInit from "canvaskit-wasm";

import { JsiSkApi } from "../web";
import type { SkColorFilter } from "../types/ColorFilter/ColorFilter";
import { Skia } from "../types";

import { makeSurface, processResult } from "./snapshot";

let Skia: ReturnType<typeof JsiSkApi>;

beforeAll(async () => {
  const CanvasKit = await CanvasKitInit();
  Skia = JsiSkApi(CanvasKit);
});

describe("Color Filters", () => {
  it("Check that CanvasKit and CanvasKit are loaded", async () => {
    expect(Skia).toBeDefined();
  });
  it("Color Matrix 1", () => {
    testColorFilter(
      Skia.ColorFilter.MakeMatrix([
        -0.578, 0.99, 0.588, 0, 0, 0.469, 0.535, -0.003, 0, 0, 0.015, 1.69,
        -0.703, 0, 0, 0, 0, 0, 1, 0,
      ]),
      "snapshots/color-filter/matrix1.png"
    );
  });
  it("Color Matrix 2", () => {
    testColorFilter(
      Skia.ColorFilter.MakeMatrix([
        0.393, 0.768, 0.188, 0, 0, 0.349, 0.685, 0.167, 0, 0, 0.272, 0.533,
        0.13, 0, 0, 0, 0, 0, 1, 0,
      ]),
      "snapshots/color-filter/matrix2.png"
    );
  });
  it("Color Matrix 3", () => {
    testColorFilter(
      Skia.ColorFilter.MakeMatrix([
        1, 0, 0, 0, 0.262, 0, 1, 0, 0, 0.262, 0, 0, 1, 0, 0.262, 0, 0, 0, 1, 0,
      ]),
      "snapshots/color-filter/matrix3.png"
    );
  });
});

const testColorFilter = (colorFilter: SkColorFilter, result: string) => {
  const { canvas, surface, width, height } = makeSurface(Skia);
  const image = Skia.Image.MakeImageFromEncoded(
    Skia.Data.fromBytes(
      fs.readFileSync(path.resolve(__dirname, "./assets/zurich.jpg"))
    )
  )!;
  const imgRect = Skia.XYWHRect(0, 0, image.width(), image.height());
  const paint = Skia.Paint();
  paint.setColorFilter(colorFilter);
  canvas.drawImageRect(
    image,
    imgRect,
    Skia.XYWHRect(0, 0, width, height),
    paint
  );
  processResult(surface, result);
};

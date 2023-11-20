import { ColorType, AlphaType } from "../types";

import { setupSkia } from "./setup";

describe("Canvas", () => {
  it("readPixels", () => {
    const { canvas, Skia } = setupSkia();
    canvas.drawColor(Skia.Color("red"));
    const pixels = canvas.readPixels(0, 0, {
      width: 1,
      height: 1,
      colorType: ColorType.RGBA_8888,
      alphaType: AlphaType.Unpremul,
    });
    expect(pixels).toBeDefined();
    expect(Array.from(pixels!)).toEqual([255, 0, 0, 255]);
  });
});

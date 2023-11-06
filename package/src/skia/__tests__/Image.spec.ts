import { loadImage } from "../../renderer/__tests__/setup";
import { ColorType, AlphaType } from "../types";

import { setupSkia } from "./setup";

describe("Image", () => {
  it("readPixels", () => {
    setupSkia();
    const image = loadImage("skia/__tests__/assets/oslo.jpg");
    const pixels = image.readPixels(0, 0, {
      width: 2,
      height: 2,
      colorType: ColorType.RGBA_8888,
      alphaType: AlphaType.Unpremul,
    });
    expect(pixels).toMatchSnapshot();
  });
});

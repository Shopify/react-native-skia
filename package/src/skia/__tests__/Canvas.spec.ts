import { ColorType, AlphaType } from "../types";

import { setupSkia } from "./setup";

describe("Canvas", () => {
  it("readPixels", () => {
    const { canvas } = setupSkia();
    const pixels = canvas.readPixels(0, 0, {
        width: 1,
        height: 1,
        colorType: ColorType.RGBA_8888,
        alphaType: AlphaType.Unpremul,
    })
    expect(pixels).toMatchSnapshot()
  });
});

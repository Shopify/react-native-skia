import { itRunsCIAndNodeOnly } from "../../../__tests__/setup";
import { fonts, surface } from "../setup";

describe("Text", () => {
  // The NotoColorEmoji font is not supported on iOS
  itRunsCIAndNodeOnly("Glyph emojis", async () => {
    const font = fonts.NotoColorEmoji;
    const result = await surface.eval(
      (_Skia, ctx) => {
        return ctx.font.getGlyphIDs("😉😍");
      },
      { font }
    );
    expect(result).toEqual([892, 896]);
  });
  it("Should calculate chinese text width correctly", async () => {
    const font = fonts.NotoSansSCRegular;
    const result = await surface.eval(
      (_Skia, ctx) => {
        return ctx.font.getTextWidth("欢迎");
      },
      { font }
    );
    expect(result).toBe(64);
  });
});

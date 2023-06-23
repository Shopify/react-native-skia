import { itRunsE2eOnly } from "../../../__tests__/setup";
import type { SkFontMgr } from "../../../skia/types";
import { FontStyle } from "../../../skia/types";
import { surface, testingFonts } from "../setup";

describe("FontMgr", () => {
  it("Custom font manager should work on every platform", async () => {
    const names = await surface.eval(
      (Skia, { fonts }) => {
        const data = fonts.map((font) =>
          Skia.Data.fromBytes(new Uint8Array(font))
        );
        const fontMgr = Skia.FontMgr.FromData(data);
        return new Array(fontMgr.countFamilies())
          .fill(0)
          .map((_, i) => fontMgr.getFamilyName(i));
      },
      { fonts: testingFonts.map((font) => [...new Uint8Array(font)]) }
    );
    expect(names.length).toBeGreaterThan(0);
    expect(names.indexOf("Helvetica")).toBe(-1);
    expect(names.indexOf("Roboto")).not.toBe(-1);
  });
  it("system font managers have at least one font", async () => {
    const names = await surface.eval(
      (Skia, { OS }) => {
        let fontMgr: SkFontMgr;
        if (OS === "node" || OS === "web") {
          fontMgr = Skia.FontMgr.FromData(
            testingFonts.map((font) =>
              Skia.Data.fromBytes(new Uint8Array(font))
            )
          );
        } else {
          fontMgr = Skia.FontMgr.System();
        }
        return new Array(fontMgr.countFamilies())
          .fill(0)
          .map((_, i) => fontMgr.getFamilyName(i));
      },
      { OS: surface.OS }
    );
    expect(names.length).toBeGreaterThan(0);
    if (surface.OS === "ios") {
      expect(names.indexOf("Apple Color Emoji")).not.toBe(-1);
    } else {
      expect(names.indexOf("Apple Color Emoji")).toBe(-1);
    }
    if (surface.OS === "ios") {
      expect(names.indexOf("Helvetica")).not.toBe(-1);
    } else {
      expect(names.indexOf("Helvetica")).toBe(-1);
    }
  });
  itRunsE2eOnly("Non-emoji font shouldn't resolve emojis", async () => {
    const width = await surface.eval(
      (Skia, { fontStyle }) => {
        const fontMgr = Skia.FontMgr.System();
        const typeface = fontMgr.matchFamilyStyle(
          fontMgr.getFamilyName(0),
          fontStyle.Normal
        );
        const font = Skia.Font(typeface, 10);
        return font.getGlyphIDs("😉😍");
      },
      { fontStyle: FontStyle }
    );
    expect(width).toEqual([0, 0]);
  });
  itRunsE2eOnly("Emoji fonts should resolve emojis", async () => {
    const fontName =
      surface.OS === "ios" ? "Apple Color Emoji" : "Noto Color Emoji";
    const width = await surface.eval(
      (Skia, { fontStyle, familyName }) => {
        const fontMgr = Skia.FontMgr.System();
        const typeface = fontMgr.matchFamilyStyle(familyName, fontStyle.Normal);
        const font = Skia.Font(typeface, 10);
        return font.getGlyphIDs("😉😍");
      },
      { fontStyle: FontStyle, familyName: fontName }
    );
    if (surface.OS === "android") {
      expect(width).toEqual([0, 0]);
    } else {
      expect(width).not.toEqual([0, 0]);
    }
  });
});

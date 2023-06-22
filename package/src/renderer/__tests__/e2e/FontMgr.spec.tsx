import { FontStyle } from "../../../skia/types";
import { surface, testingFonts } from "../setup";

describe("FontMgr", () => {
  it("should have at least one font", async () => {
    const names = await surface.eval(
      (Skia, { OS }) => {
        if (OS === "node" || OS === "web") {
          Skia.FontMgr.loadFontsOnWeb(...testingFonts);
        }
        const fontMgr = Skia.FontMgr.getInstance();
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
    } else if (surface.OS === "android") {
      expect(names.indexOf("helvetica")).not.toBe(-1);
    } else {
      expect(names.indexOf("Helvetica")).toBe(-1);
    }
  });
  it("Non-emoji font shouldn't resolve emojis", async () => {
    const width = await surface.eval(
      (Skia, { OS, fontStyle }) => {
        if (OS === "node" || OS === "web") {
          Skia.FontMgr.loadFontsOnWeb(...testingFonts);
        }
        const fontMgr = Skia.FontMgr.getInstance();
        const typeface = fontMgr.matchFamilyStyle(
          fontMgr.getFamilyName(0),
          fontStyle.Normal
        );
        const font = Skia.Font(typeface, 10);
        return font.getGlyphIDs("😉😍");
      },
      { OS: surface.OS, fontStyle: FontStyle }
    );
    expect(width).toEqual([0, 0]);
  });
  it("Emoji fonts should resolve emojis", async () => {
    const fontName =
      surface.OS === "ios" ? "Apple Color Emoji" : "Noto Color Emoji";
    const width = await surface.eval(
      (Skia, { OS, fontStyle, familyName }) => {
        if (OS === "node" || OS === "web") {
          Skia.FontMgr.loadFontsOnWeb(...testingFonts);
        }
        const fontMgr = Skia.FontMgr.getInstance();
        const typeface = fontMgr.matchFamilyStyle(familyName, fontStyle.Normal);
        const font = Skia.Font(typeface, 10);
        return font.getGlyphIDs("😉😍");
      },
      { OS: surface.OS, fontStyle: FontStyle, familyName: fontName }
    );
    if (surface.OS === "android") {
      expect(width).toEqual([0, 0]);
    } else {
      expect(width).not.toEqual([0, 0]);
    }
  });
});

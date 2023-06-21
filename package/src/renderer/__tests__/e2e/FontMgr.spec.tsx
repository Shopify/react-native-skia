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
  });
});

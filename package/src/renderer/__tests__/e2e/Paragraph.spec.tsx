import { surface } from "../setup";

describe("Paragraph", () => {
  it("Should return whether the paragraph builder requires ICU data to be provided by the client", async () => {
    const result = await surface.eval((Skia) => {
      return Skia.Paragraph.RequiresClientICU();
    });
    if (surface.OS === "android") {
      expect(result).toEqual(true);
    } else {
      expect(result).toEqual(false);
    }
  });
});

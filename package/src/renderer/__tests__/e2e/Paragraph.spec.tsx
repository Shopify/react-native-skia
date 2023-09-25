import type { TestOS } from "../setup";
import { surface } from "../setup";

describe("Paragraph", () => {
  it("Should return whether the paragraph builder requires ICU data to be provided by the client", async () => {
    const result = await surface.eval((Skia) => {
      return Skia.Paragraph.RequiresClientICU();
    });
    // Currently, iOS requires ICU data to be provided by the client
    const expectResults: Record<TestOS, boolean> = {
      android: false,
      ios: true,
      web: false,
      node: false,
    };
    expect(result).toEqual(expectResults[surface.OS]);
  });
});

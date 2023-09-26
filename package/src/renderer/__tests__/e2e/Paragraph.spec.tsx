import type { TestOS } from "../setup";
import { surface } from "../setup";

const getBoundaries = (
  text: string,
  granularity: "word" | "grapheme" | "sentence"
) => {
  const segmenter = new Intl.Segmenter("en", { granularity });
  const segments = segmenter.segment(text);

  const boundaries: number[] = [];
  for (const segment of segments) {
    boundaries.push(segment.index);
  }
  boundaries.push(text.length);
  return boundaries;
};

describe("Paragraph", () => {
  it("Should return whether the paragraph builder requires ICU data to be provided by the client", async () => {
    const result = await surface.eval((Skia) => {
      return Skia.Paragraph.RequiresClientICU();
    });
    // Currently, only iOS requires ICU data to be provided by the client
    const expectResults: Record<TestOS, boolean> = {
      android: false,
      ios: true,
      web: false,
      node: false,
    };
    expect(result).toEqual(expectResults[surface.OS]);
  });
  it("Should tokenize text", async () => {
    const text = `  On the other hand, we denounce with righteous indignation and dislike men
    who are so beguiled and demoralized by the charms of pleasure of the moment,
    so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue;
    and equal blame belongs to those who fail in their duty through weakness of will,
    which is the same as saying through shrinking from toil and pain.`;
    const result = await surface.eval(
      (Skia, ctx) => {
        return Skia.Paragraph.TokenizeText(ctx.text);
      },
      { text }
    );
    if (surface.OS === "ios") {
      expect(result).toBeTruthy();
      const tokens = result!;
      // TODO: add missing first index
      expect([0, ...tokens.words]).toEqual(getBoundaries(text, "word"));
      expect([0, ...tokens.graphemes]).toEqual(getBoundaries(text, "grapheme"));
      //expect(tokens.breaks).toEqual(getBoundaries(text, "sentence"));
    } else {
      expect(result).toEqual(null);
    }
  });
});

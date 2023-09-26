import type { TestOS } from "../setup";
import { surface } from "../setup";

const getTokens = (text: string, granularity: "grapheme" | "word") => {
  const segmenter = new Intl.Segmenter("en", { granularity });
  const segments = segmenter.segment(text);

  const boundaries: number[] = [];
  for (const segment of segments) {
    if (granularity === "word" && !segment.isWordLike) {
      continue;
    }
    boundaries.push(segment.index);
  }
  boundaries.push(text.length);
  return boundaries;
};

const getWords = (text: string) => getTokens(text, "word");
const getGraphemes = (text: string) => getTokens(text, "grapheme");

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
    const text = `  On the other hand, we denounce with righteous indignation and 
    dislike men who are so beguiled and demoralized by the charms of 
    pleasure of the moment, so blinded by desire, that they cannot foresee 
    the pain and trouble that are bound to ensue; and equal blame belongs 
    to those who fail in their duty through weakness of will, which is 
    the same as saying through shrinking from toil and pain. `;
    const result = await surface.eval(
      (Skia, ctx) => {
        return Skia.Paragraph.TokenizeText(ctx.text);
      },
      { text }
    );
    if (surface.OS === "ios") {
      expect(result).toBeTruthy();
      const tokens = result!;
      expect(tokens.words).toEqual(getWords(text));
      expect(tokens.graphemes).toEqual(getGraphemes(text));
      //expect(tokens.breaks).toEqual(getBoundaries(text, "sentence"));
    } else {
      expect(result).toEqual(null);
    }
  });
});

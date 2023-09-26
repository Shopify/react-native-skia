import type { TestOS } from "../setup";
import { surface } from "../setup";

const getTokens = (
  text: string,
  locales: string | string[],
  granularity: "grapheme" | "word" | "sentence"
) => {
  const segmenter = new Intl.Segmenter(locales, { granularity });
  const segments = segmenter.segment(text);

  const boundaries: number[] = [];
  for (const segment of segments) {
    if (granularity === "word" && !segment.isWordLike) {
      continue;
    }
    boundaries.push(segment.index);
    if (granularity === "sentence") {
      boundaries.push(0);
    }
  }
  boundaries.push(text.length);
  return boundaries;
};

const getWords = (text: string, locales = "en") =>
  getTokens(text, locales, "word");
const getGraphemes = (text: string, locales = "end") =>
  getTokens(text, locales, "grapheme");
//const getLineBreaks = (text: string) => getTokens(text, "sentence");

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
  it("Should tokenize english text", async () => {
    const text = `  On the other hand, we denounce with righteous indignation and dislike men
       who are so beguiled and demoralized by the too charms of pleasure of the moment,
       so blinded by desire, that they cannot foresee the pain and trouble 
       that are bound are  ensue; and equal blame belongs to those who
       fail in their duty through weakness of will, which is the same as sayngthrough
       shrinking from toil and pain. On the other hand, we denounce with righteous
       indignation and dislike men who are so beguiled and demoralized by the too charms
       of pleasure of the moment, so blinded by desire, that they cannot foresee the pain
        and trouble that are bound are  ensue.`;
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
      //expect(tokens.breaks.flat()).toEqual(getLineBreaks(text));
    } else {
      expect(result).toEqual(null);
    }
  });
  it("Should tokenize japanese text", async () => {
    // I am a cat. My name is Tanuki.
    const text = " 吾輩は猫である。名前はたぬき。 ";
    const result = await surface.eval(
      (Skia, ctx) => {
        return Skia.Paragraph.TokenizeText(ctx.text);
      },
      { text }
    );
    if (surface.OS === "ios") {
      expect(result).toBeTruthy();
      const tokens = result!;
      expect(tokens.words).toEqual(getWords(text, "jp"));
      expect(tokens.graphemes).toEqual(getGraphemes(text, "jp"));
      //expect(tokens.breaks.flat()).toEqual(getLineBreaks(text));
    } else {
      expect(result).toEqual(null);
    }
  });
  // it("Should tokenize text (2)", async () => {
  //   const text = `The لاquick 😠(brown) fox
  //   واحد (اثنان) ثلاثة

  // You can separate Thai words as well.

  //'แยกคำภาษาไทยก็ทำได้นะจ้ะ'
});

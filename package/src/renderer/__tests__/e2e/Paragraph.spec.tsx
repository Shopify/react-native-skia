import type { TestOS } from "../setup";
import { surface } from "../setup";

const getTokens = (
  text: string,
  locales: string | string[],
  granularity: "grapheme" | "word"
) => {
  const segmenter = new Intl.Segmenter(locales, { granularity });
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

const getWords = (text: string, locales = "en") =>
  getTokens(text, locales, "word");
const getGraphemes = (text: string, locales = "en") =>
  getTokens(text, locales, "grapheme");

const getLineBreaks = (text: string, locales = "en") => {
  const segmenter = new Intl.Segmenter(locales, { granularity: "word" });
  const segments = segmenter.segment(text);

  const boundaries: number[] = [];
  for (const segment of segments) {
    if (segment.isWordLike) {
      boundaries.push(segment.index, 0);
    } else if (segment.segment === "\n") {
      boundaries.push(segment.index + 1, 1);
    }
  }
  boundaries.push(text.length, 0);
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
  it("should first check if our JS reference results are correct", async () => {
    const examples = [
      {
        text: "Jack    and Jill, went over hill, and got lost. Alert!",
        result: [
          0, 0, 8, 0, 12, 0, 18, 0, 23, 0, 28, 0, 34, 0, 38, 0, 42, 0, 48, 0,
          54, 0,
        ],
      },
      { text: "Hello", result: [0, 0, 5, 0] },
      { text: "Hello.", result: [0, 0, 6, 0] },
      { text: "Hello World.", result: [0, 0, 6, 0, 12, 0] },
      { text: "Hello World. ", result: [0, 0, 6, 0, 13, 0] },

      {
        text: "Hello World. I'm Skia.",
        result: [0, 0, 6, 0, 13, 0, 17, 0, 22, 0],
      },
      {
        text: `Hello
        World.
        I am Skia.`,
        result: [0, 0, 6, 1, 14, 0, 21, 1, 29, 0, 31, 0, 34, 0, 39, 0],
      },
    ];
    for (const example of examples) {
      const tokens = getLineBreaks(example.text);
      expect(tokens).toEqual(example.result);
    }
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

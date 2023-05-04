import { resolveFile } from "../../renderer/__tests__/setup";
import { processResult } from "../../__tests__/setup";
import type { ParagraphStyle } from "../types/Paragraph";
import { TextAlign } from "../types/Paragraph";

import { setupSkia } from "./setup";

const roboto = resolveFile("skia/__tests__/assets/Roboto-Regular.ttf");
const noto = resolveFile("skia/__tests__/assets/NotoColorEmoji.ttf");

describe("Text", () => {
  it("should display the paragraph layout properly using the typeface provider", async () => {
    const { surface, canvas, width, Skia } = setupSkia();
    const fontSrc = Skia.TypefaceFontProvider.Make();
    fontSrc.registerFont(roboto, "Roboto");
    fontSrc.registerFont(noto, "Noto Color Emoji");
    const paraStyle: ParagraphStyle = {
      textStyle: {
        color: Skia.Color("black"),
        fontFamilies: ["Roboto", "Noto Color Emoji"],
        fontSize: 35,
      },
      textAlign: TextAlign.Left,
      maxLines: 4,
      ellipsis: "...",
    };
    const str =
      "The quick brown fox 🦊 ate a zesty hamburgerfons 🍔.\nThe 👩‍👩‍👧‍👧 laughed.";
    const builder = Skia.ParagraphBuilder.MakeFromFontProvider(
      paraStyle,
      fontSrc
    );
    builder.addText(str);
    const paragraph = builder.build();
    paragraph.layout(width);
    expect(paragraph.getHeight()).not.toBe(0);
    canvas.drawParagraph(paragraph, 0, 0);
    processResult(surface, "snapshots/drawings/paragraph.png");
  });
  it("should display the paragraph layout with different text color", async () => {
    const { surface, canvas, width, Skia } = setupSkia();
    const fontSrc = Skia.TypefaceFontProvider.Make();
    fontSrc.registerFont(roboto, "Roboto");
    fontSrc.registerFont(noto, "Noto Color Emoji");
    const paraStyle: ParagraphStyle = {
      textStyle: {
        color: Skia.Color("black"),
        fontFamilies: ["Roboto", "Noto Color Emoji"],
        fontSize: 16,
      },
      textAlign: TextAlign.Left,
      maxLines: 4,
      ellipsis: "...",
    };
    const str = "The quick brown fox 🦊";
    const builder = Skia.ParagraphBuilder.MakeFromFontProvider(
      paraStyle,
      fontSrc
    );
    builder.addText(str);
    const bg = Skia.Paint();
    bg.setColor(Skia.Color("black"));
    const fg = Skia.Paint();
    fg.setColor(Skia.Color("white"));
    builder.pushPaintStyle(
      {
        fontSize: 16,
      },
      fg,
      bg
    );
    builder.addText(" ate a zesty hamburgerfons 🍔.");
    builder.pop();
    builder.pushStyle({
      color: Skia.Color("pink"),
    });
    builder.addText("\nThe 👩‍👩‍👧‍👧");
    builder.pop();
    builder.addText(" laughed.");
    const paragraph = builder.build();
    paragraph.layout(width);
    expect(paragraph.getHeight()).not.toBe(0);
    canvas.drawParagraph(paragraph, 0, 0);
    processResult(surface, "snapshots/drawings/paragraph-with-colors.png");
  });
});

import { surface } from "../setup";
import { checkImage } from "../../../__tests__/setup";
import {
  FontStyle,
  SkTextAlign,
  SkTextDirection,
  TextDecoration,
} from "../../../skia/types";

describe("Paragraphs", () => {
  it("should render simple paragraph", async () => {
    const img = await surface.drawParagraph((Skia) =>
      Skia.ParagraphBuilder.Make({
        textStyle: { color: Skia.Color("black") },
      })
        .addText("Hello from Skia!")
        .build()
    );
    checkImage(img, `snapshots/paragraph/simple-paragraph-${surface.OS}.png`);
  });

  it("should render paragraph linebreaks", async () => {
    const img = await surface.drawParagraph((Skia) =>
      Skia.ParagraphBuilder.Make({
        textStyle: { color: Skia.Color("black") },
      })
        .addText("Hello\nfrom Skia")
        .build()
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-linebreaks-${surface.OS}.png`
    );
  });

  it("should break when line is long", async () => {
    const img = await surface.drawParagraph(
      (Skia) =>
        Skia.ParagraphBuilder.Make({
          textStyle: { color: Skia.Color("black") },
        })
          .addText("Hello from a really, really long line - and from Skia!")
          .build(),
      50
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-auto-linebreaks-${surface.OS}.png`
    );
  });

  it("should align text to the right", async () => {
    const img = await surface.drawParagraph(
      (Skia, { textAlign }) =>
        Skia.ParagraphBuilder.Make({
          textStyle: { color: Skia.Color("black") },
          textAlign,
        })
          .addText("Hello Skia!")
          .build(),
      50,
      { textAlign: SkTextAlign.Right }
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-text-align-right-${surface.OS}.png`
    );
  });

  it("should align text centered", async () => {
    const img = await surface.drawParagraph(
      (Skia, { textAlign }) =>
        Skia.ParagraphBuilder.Make({
          textStyle: { color: Skia.Color("black") },
          textAlign,
        })
          .addText("Hello Skia!")
          .build(),
      50,
      { textAlign: SkTextAlign.Center }
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-text-align-center-${surface.OS}.png`
    );
  });

  it("should align text justified", async () => {
    const img = await surface.drawParagraph(
      (Skia, { textAlign }) =>
        Skia.ParagraphBuilder.Make({
          textStyle: { color: Skia.Color("black") },
          textAlign,
        })
          .addText(
            "Hello Skia this text should be justified - what do you think? Is it justified?"
          )
          .build(),
      50,
      { textAlign: SkTextAlign.Justify }
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-text-align-justify-${surface.OS}.png`
    );
  });

  it("should render text right to left", async () => {
    const img = await surface.drawParagraph(
      (Skia, { textDirection }) =>
        Skia.ParagraphBuilder.Make({
          textStyle: { color: Skia.Color("black") },
          textDirection,
        })
          .addText("Hello Skia RTL\nThis is a new line")
          .build(),
      150,
      { textDirection: SkTextDirection.RTL }
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-text-align-rtl-${surface.OS}.png`
    );
  });
  // Test 1
  it("should show ellipse when line count is above max lines", async () => {
    const img = await surface.drawParagraph(
      (Skia, { maxLines, ellipsis }) =>
        Skia.ParagraphBuilder.Make({
          textStyle: { color: Skia.Color("black") },
          maxLines,
          ellipsis,
        })
          .addText("Hello Skia - maxLine is 1!")
          .build(),
      50,
      { maxLines: 1, ellipsis: "..." }
    );
    checkImage(img, `snapshots/paragraph/paragraph-ellipse-${surface.OS}.png`);
  });

  // Test 2
  it("should use textstyle in paraphstyle", async () => {
    const img = await surface.drawParagraph(
      (Skia) =>
        Skia.ParagraphBuilder.Make({
          textStyle: { color: Skia.Color("red") },
        })
          .addText("Hello Skia!")
          .build(),
      50
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-text-style-in-paragraph-style-${surface.OS}.png`
    );
  });

  // Test 3
  it("should support colors", async () => {
    const img = await surface.drawParagraph(
      (Skia) =>
        Skia.ParagraphBuilder.Make({
          textStyle: { color: Skia.Color("black") },
        })
          .pushStyle({ color: Skia.Color("red") })
          .addText("Hello Skia in red color")
          .pop()
          .pushStyle({ backgroundColor: Skia.Color("blue") })
          .addText("Hello Skia in blue backgroundcolor")
          .pop()
          .pushStyle({ foregroundColor: Skia.Color("yellow") })
          .addText("Hello Skia with yellow foregroundcolor")
          .pop()
          .build(),
      150
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-text-style-colors-${surface.OS}.png`
    );
  });

  it("should support text decoration", async () => {
    const img = await surface.drawParagraph(
      (Skia, { Overline, LineThrough, Underline }) =>
        Skia.ParagraphBuilder.Make({
          textStyle: { color: Skia.Color("black") },
        })
          .pushStyle({
            decoration: Underline,
            decorationColor: Skia.Color("blue"),
          })
          .addText("Hello Skia with blue underline")
          .pop()
          .pushStyle({
            decoration: LineThrough,
            decorationColor: Skia.Color("red"),
          })
          .addText("Hello Skia with red strike-through")
          .pop()
          .pushStyle({
            decoration: Overline,
            decorationColor: Skia.Color("green"),
          })
          .addText("Hello Skia with green overline")
          .pop()
          .build(),
      150,
      {
        Overline: TextDecoration.Overline,
        LineThrough: TextDecoration.LineThrough,
        Underline: TextDecoration.Underline,
      }
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-text-style-decoration-${surface.OS}.png`
    );
  });

  it("should support font styling", async () => {
    const img = await surface.drawParagraph(
      (Skia, { Italic, Bold, BoldItalic }) =>
        Skia.ParagraphBuilder.Make({
          textStyle: { color: Skia.Color("black") },
        })
          .pushStyle({ fontStyle: Italic })
          .addText("Hello Skia in italic")
          .pop()
          .pushStyle({ fontStyle: Bold })
          .addText("Hello Skia in bold")
          .pop()
          .pushStyle({ fontStyle: BoldItalic })
          .addText("Hello Skia in bold-italic")
          .pop()
          .build(),
      150,
      {
        Italic: FontStyle.Italic,
        Bold: FontStyle.Bold,
        BoldItalic: FontStyle.BoldItalic,
      }
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-text-style-font-style-${surface.OS}.png`
    );
  });

  it("should support font shadows", async () => {
    const img = await surface.drawParagraph(
      (Skia) =>
        Skia.ParagraphBuilder.Make({
          textStyle: {
            color: Skia.Color("black"),
            fontSize: 25,
            shadows: [
              {
                color: Skia.Color("#ff000044"),
                blurRadius: 4,
                offset: { x: 4, y: 4 },
              },
            ],
          },
        })
          .addText("Hello Skia with red shadow")
          .build(),
      150
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-text-style-font-shadow-${surface.OS}.png`
    );
  });
});

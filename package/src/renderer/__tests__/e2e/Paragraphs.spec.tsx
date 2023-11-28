import { surface } from "../setup";
import { checkImage, itRunsE2eOnly } from "../../../__tests__/setup";
import {
  FontStyle,
  SkTextAlign,
  SkTextDirection,
  TextDecoration,
} from "../../../skia/types";

describe("Paragraphs", () => {
  itRunsE2eOnly("should render simple paragraph", async () => {
    const img = await surface.drawParagraph((Skia) => {
      return Skia.ParagraphBuilder.Make().addText("Hello from Skia!").build();
    });
    checkImage(img, `snapshots/paragraph/simple-paragraph-${surface.OS}.png`);
  });

  itRunsE2eOnly("should render paragraph linebreaks", async () => {
    const img = await surface.drawParagraph((Skia) =>
      Skia.ParagraphBuilder.Make().addText("Hello\nfrom Skia").build()
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-linebreaks-${surface.OS}.png`
    );
  });

  itRunsE2eOnly("should break when line is long", async () => {
    const img = await surface.drawParagraph(
      (Skia) =>
        Skia.ParagraphBuilder.Make()
          .addText("Hello from a really, really long line - and from Skia!")
          .build(),
      50
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-auto-linebreaks-${surface.OS}.png`
    );
  });

  itRunsE2eOnly("should align text to the right", async () => {
    const img = await surface.drawParagraph(
      (Skia, { textAlign }) =>
        Skia.ParagraphBuilder.Make({
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

  itRunsE2eOnly("should align text centered", async () => {
    const img = await surface.drawParagraph(
      (Skia, { textAlign }) =>
        Skia.ParagraphBuilder.Make({
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

  itRunsE2eOnly("should align text justified", async () => {
    const img = await surface.drawParagraph(
      (Skia, { textAlign }) =>
        Skia.ParagraphBuilder.Make({
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

  itRunsE2eOnly("should render text right to left", async () => {
    const img = await surface.drawParagraph(
      (Skia, { textDirection }) =>
        Skia.ParagraphBuilder.Make({
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
  itRunsE2eOnly(
    "should show ellipse when line count is above max lines",
    async () => {
      const img = await surface.drawParagraph(
        (Skia, { maxLines, ellipsis }) =>
          Skia.ParagraphBuilder.Make({
            maxLines,
            ellipsis,
          })
            .addText("Hello Skia - maxLine is 1!")
            .build(),
        50,
        { maxLines: 1, ellipsis: "..." }
      );
      checkImage(
        img,
        `snapshots/paragraph/paragraph-ellipse-${surface.OS}.png`
      );
    }
  );

  // Test 2
  itRunsE2eOnly("should use textstyle in paraphstyle", async () => {
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
  itRunsE2eOnly("should support colors", async () => {
    const img = await surface.drawParagraph(
      (Skia) =>
        Skia.ParagraphBuilder.Make()
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

  itRunsE2eOnly("should support text decoration", async () => {
    const img = await surface.drawParagraph(
      (Skia, { Overline, LineThrough, Underline }) =>
        Skia.ParagraphBuilder.Make()
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

  itRunsE2eOnly("should support font styling", async () => {
    const img = await surface.drawParagraph(
      (Skia, { Italic, Bold, BoldItalic }) =>
        Skia.ParagraphBuilder.Make()
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

  itRunsE2eOnly("should support font shadows", async () => {
    const img = await surface.drawParagraph(
      (Skia) =>
        Skia.ParagraphBuilder.Make({
          textStyle: {
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

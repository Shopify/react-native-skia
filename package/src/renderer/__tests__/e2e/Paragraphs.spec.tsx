import React from "react";

import { surface, importSkia } from "../setup";
import { Fill, Paragraph } from "../../components";
import { checkImage } from "../../../__tests__/setup";
import type { SkParagraph } from "../../../skia";
import type { Skia } from "../../../skia/types";
import {
  FontStyle,
  SkTextAlign,
  SkTextDirection,
  TextDecoration,
} from "../../../skia/types";

const renderParagraph = async (
  p: (Skia: Skia) => SkParagraph,
  layoutWidth?: number
) => {
  const { width } = surface;
  const { Skia } = importSkia();
  const paragraph = p(Skia);
  return await surface.draw(
    <>
      <Fill color="black" />
      <Paragraph
        paragraph={paragraph}
        x={0}
        y={0}
        width={layoutWidth ?? width}
      />
    </>
  );
};

describe("Paragraphs", () => {
  describe("Paragraphs", () => {
    it("should render simple paragraph", async () => {
      const img = await renderParagraph((Skia) =>
        Skia.ParagraphBuilder.Make().addText("Hello from Skia!").build()
      );
      checkImage(img, "snapshots/paragraph/simple-paragraph.png");
    });

    it("should render paragraph linebreaks", async () => {
      const img = await renderParagraph((Skia) =>
        Skia.ParagraphBuilder.Make().addText("Hello\nfrom Skia").build()
      );
      checkImage(img, "snapshots/paragraph/paragraph-linebreaks.png");
    });

    it("should break when line is long", async () => {
      const img = await renderParagraph(
        (Skia) =>
          Skia.ParagraphBuilder.Make()
            .addText("Hello from a really, really long line - and from Skia!")
            .build(),
        50
      );
      checkImage(img, "snapshots/paragraph/paragraph-auto-linebreaks.png");
    });

    it("should align text to the right", async () => {
      const img = await renderParagraph(
        (Skia) =>
          Skia.ParagraphBuilder.Make({
            textAlign: SkTextAlign.Right,
          })
            .addText("Hello Skia!")
            .build(),
        50
      );
      checkImage(img, "snapshots/paragraph/paragraph-text-align-right.png");
    });

    it("should align text centered", async () => {
      const img = await renderParagraph(
        (Skia) =>
          Skia.ParagraphBuilder.Make({
            textAlign: SkTextAlign.Center,
          })
            .addText("Hello Skia!")
            .build(),
        50
      );
      checkImage(img, "snapshots/paragraph/paragraph-text-align-center.png");
    });

    it("should align text justified", async () => {
      const img = await renderParagraph(
        (Skia) =>
          Skia.ParagraphBuilder.Make({
            textAlign: SkTextAlign.Justify,
          })
            .addText(
              "Hello Skia this text should be justified - what do you think? Is it justified?"
            )
            .build(),
        50
      );
      checkImage(img, "snapshots/paragraph/paragraph-text-align-justify.png");
    });

    it("should render text right to left", async () => {
      const img = await renderParagraph(
        (Skia) =>
          Skia.ParagraphBuilder.Make({
            textDirection: SkTextDirection.RTL,
          })
            .addText("Hello Skia RTL\nThis is a new line")
            .build(),
        150
      );
      checkImage(img, "snapshots/paragraph/paragraph-text-align-rtl.png");
    });

    it("should show ellipse when line count is above max lines", async () => {
      const img = await renderParagraph(
        (Skia) =>
          Skia.ParagraphBuilder.Make({
            maxLines: 1,
            ellipsis: "...",
          })
            .addText("Hello Skia - maxLine is 1!")
            .build(),
        50
      );
      checkImage(img, "snapshots/paragraph/paragraph-ellipse.png");
    });

    it("should use textstyle in paraphstyle", async () => {
      const img = await renderParagraph(
        (Skia) =>
          Skia.ParagraphBuilder.Make({
            textStyle: {
              color: Skia.Color("red"),
            },
          })
            .addText("Hello Skia!")
            .build(),
        50
      );
      checkImage(
        img,
        "snapshots/paragraph/paragraph-text-style-in-paragraph-style.png"
      );
    });
  });
  describe("Paragraphs with textstyles", () => {
    it("should support colors", async () => {
      const img = await renderParagraph(
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
      checkImage(img, "snapshots/paragraph/paragraph-text-style-colors.png");
    });

    it("should support text decoration", async () => {
      const img = await renderParagraph(
        (Skia) =>
          Skia.ParagraphBuilder.Make()
            .pushStyle({
              decoration: TextDecoration.Underline,
              decorationColor: Skia.Color("blue"),
            })
            .addText("Hello Skia with blue underline")
            .pop()
            .pushStyle({
              decoration: TextDecoration.LineThrough,
              decorationColor: Skia.Color("red"),
            })
            .addText("Hello Skia with red strike-through")
            .pop()
            .pushStyle({
              decoration: TextDecoration.Overline,
              decorationColor: Skia.Color("green"),
            })
            .addText("Hello Skia with green overline")
            .pop()
            .build(),
        150
      );
      checkImage(
        img,
        "snapshots/paragraph/paragraph-text-style-decoration.png"
      );
    });

    it("should support font styling", async () => {
      const img = await renderParagraph(
        (Skia) =>
          Skia.ParagraphBuilder.Make()
            .pushStyle({ fontStyle: FontStyle.Italic })
            .addText("Hello Skia in italic")
            .pop()
            .pushStyle({ fontStyle: FontStyle.Bold })
            .addText("Hello Skia in bold")
            .pop()
            .pushStyle({ fontStyle: FontStyle.BoldItalic })
            .addText("Hello Skia in bold-italic")
            .pop()
            .build(),
        150
      );
      checkImage(
        img,
        "snapshots/paragraph/paragraph-text-style-font-style.png"
      );
    });
  });
});

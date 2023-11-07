import React from "react";

import { surface, importSkia } from "../setup";
import { Paragraph } from "../../components";
import { checkImage } from "../../../__tests__/setup";
import { SkParagraph } from "../../../skia";
import { SkTextAlign, Skia } from "../../../skia/types";

const renderParagraph = async (
  p: (Skia: Skia) => SkParagraph,
  layoutWidth?: number
) => {
  const { width } = surface;
  const { Skia } = importSkia();
  const paragraph = p(Skia);
  return await surface.draw(
    <Paragraph paragraph={paragraph} x={0} y={0} width={layoutWidth ?? width} />
  );
};

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
        Skia.ParagraphBuilder.Make({ textAlign: SkTextAlign.Right })
          .addText("Hello Skia!")
          .build(),
      50
    );
    checkImage(img, "snapshots/paragraph/paragraph-text-align.png");
  });

  // it("should render text with colored text", async () => {
  //   const img = await renderParagraph((Skia) =>
  //     Skia.ParagraphBuilder.Make()
  //       .pushStyle({
  //         color: Skia.Color("red"),
  //       })
  //       .addText("Hello from Skia")
  //       .build()
  //   );
  //   checkImage(img, "snapshots/paragraph/paragraph-colored.png");
  // });
});

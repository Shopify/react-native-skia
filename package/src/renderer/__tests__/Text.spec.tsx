import React from "react";

import { processResult, docPath } from "../../__tests__/setup";
import { TextPath, Fill, Text, Glyphs, TextBlob } from "../components";

import { drawOnNode, Skia, width, font, fontSize } from "./setup";

describe("Test different text examples", () => {
  it("Should draw Hello World", () => {
    const surface = drawOnNode(
      <>
        <Fill color="white" />
        <Text x={0} y={fontSize} font={font} text="Hello World" />
      </>
    );
    processResult(surface, docPath("text/hello-world.png"), true);
  });

  it("Should draw Hello World vertically", () => {
    const glyphs = font
      .getGlyphIDs("Hello World!")
      .map((id, i) => ({ id, pos: Skia.Point(0, (i + 1) * fontSize) }));
    const surface = drawOnNode(
      <>
        <Fill color="white" />
        <Glyphs font={font} glyphs={glyphs} />
      </>
    );
    processResult(surface, docPath("text/hello-world-vertical.png"), true);
  });

  it("Should render the text around a circle", () => {
    const path = Skia.Path.Make();
    const r = width / 2;
    path.addCircle(r, r, r);
    const surface = drawOnNode(
      <>
        <Fill color="white" />
        <TextPath font={font} path={path} text="Hello World!" />
      </>
    );
    processResult(surface, docPath("text/text-path.png"), true);
  });

  it("Should render a text blob", () => {
    const blob = Skia.TextBlob.MakeFromText("Hello World!", font);
    const surface = drawOnNode(
      <>
        <Fill color="white" />
        <TextBlob blob={blob} y={fontSize} x={0} />
      </>
    );
    processResult(surface, docPath("text/text-blob.png"), true);
  });
});

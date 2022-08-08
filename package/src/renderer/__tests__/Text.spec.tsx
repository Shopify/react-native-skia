import React from "react";

import { processResult } from "../../__tests__/setup";
import { TextPath, Fill, Text } from "../components";

import { drawOnNode, Skia, width, font, fontSize } from "./setup";

describe("Test different text examples", () => {
  it("Should use display Hello World using the Roboto typeface", () => {
    const surface = drawOnNode(
      <>
        <Fill color="white" />
        <Text x={0} y={fontSize} font={font} text="Hello World" />
      </>
    );
    processResult(surface, "snapshots/text/hello-world.png");
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
    processResult(surface, "snapshots/text/text-path.png", true);
  });
});

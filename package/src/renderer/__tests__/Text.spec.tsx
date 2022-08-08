import nodePath from "path";
import fs from "fs";

import React from "react";

import { processResult } from "../../__tests__/setup";
import { TextPath, Fill } from "../components";

import { drawOnNode, Skia, width } from "./setup";

describe("Test different text examples", () => {
  it("Should render the text around a circle", () => {
    const data = Skia.Data.fromBytes(
      fs.readFileSync(
        nodePath.resolve(
          __dirname,
          "../../skia/__tests__/assets/Roboto-Medium.ttf"
        )
      )
    );
    const tf = Skia.Typeface.MakeFreeTypeFaceFromData(data);
    expect(tf).toBeDefined();
    const font = Skia.Font(tf!, 32);
    expect(font).toBeDefined();
    const path = Skia.Path.Make();
    const r = width / 2;
    path.addCircle(r, r, r);
    const surface = drawOnNode(
      <>
        <Fill color="white" />
        <TextPath font={font} path={path} text="Hello World!" />
      </>
    );
    processResult(surface, "snapshots/drawings/text-around-a-circle.png", true);
  });
});

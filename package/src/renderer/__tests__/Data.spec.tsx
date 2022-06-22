import path from "path";

import React from "react";

import { processResult } from "../../__tests__/setup";
import { Fill } from "../components";
import * as SkiaRenderer from "../index";

import { mountCanvas, nodeRequire } from "./setup";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface MyCompProps {}

const MyComp = ({}: MyCompProps) => {
  const { useFont } = require("../../skia/core/Font");
  const font = useFont(
    nodeRequire(
      path.resolve(__dirname, "../../skia/__tests__/assets/Roboto-Medium.ttf")
    )
  );
  if (!font) {
    return <Fill color="red" />;
  }
  return <Fill color="green" />;
};

describe("Data Loading", () => {
  it("Loads renderer without Skia", async () => {
    expect(SkiaRenderer).toBeDefined();
  });
  it("Should load a font file", async () => {
    const { surface, draw } = mountCanvas(<MyComp />);
    draw();
    processResult(surface, "snapshots/font/red.png");
    await wait(500);
    draw();
    processResult(surface, "snapshots/font/green.png");
  });
});

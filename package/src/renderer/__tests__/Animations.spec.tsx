import React from "react";

import { ValueApi } from "../../values/web";
import { processResult } from "../../__tests__/setup";
import { Rect } from "../components";
import * as SkiaRenderer from "../index";
import type { SkiaValue } from "../../values/types";

import { width, mountCanvas } from "./setup";

interface GrowingRectProps {
  size: SkiaValue<number>;
}

const GrowingRect = ({ size }: GrowingRectProps) => {
  return <Rect x={0} y={0} width={size} height={size} color="lightblue" />;
};

describe("Renderer", () => {
  it("Loads renderer without Skia", () => {
    expect(SkiaRenderer).toBeDefined();
  });
  it("Should draw a lightblue rectangle taking a quarter of the canvas size that will then fill up the canvas", () => {
    const size = ValueApi.createValue(width / 2);
    const { surface, draw } = mountCanvas(<GrowingRect size={size} />);
    draw();
    processResult(surface, "snapshots/animations/quarter-lightblue.png");
    size.current = width;
    draw();
    processResult(surface, "snapshots/animations/lightblue.png");
  });
});

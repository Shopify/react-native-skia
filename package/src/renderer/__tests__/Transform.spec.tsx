import React from "react";

import { processResult } from "../../__tests__/setup";
import { Group, Rect } from "../components";
import * as SkiaRenderer from "../index";

import { drawOnNode, width, Skia } from "./setup";

describe("Renderer", () => {
  it("Loads renderer without Skia", () => {
    expect(SkiaRenderer).toBeDefined();
  });
  it("Scale with origin", () => {
    const size = width;
    const origin = Skia.Point(size / 2, size / 2);
    const surface = drawOnNode(
      <Group transform={[{ scale: 0.5 }]} origin={origin}>
        <Rect x={0} y={0} width={size} height={size} color="lightblue" />
      </Group>
    );
    processResult(surface, "snapshots/transform/scale-origin.png");
  });
  it("Scale with origin using a matrix", () => {
    const size = width;
    const matrix = Skia.Matrix();
    const origin = Skia.Point(size / 2, size / 2);
    matrix.translate(origin.x, origin.y);
    matrix.scale(0.5);
    matrix.translate(-origin.x, -origin.y);
    const surface = drawOnNode(
      <Group matrix={matrix}>
        <Rect x={0} y={0} width={size} height={size} color="lightblue" />
      </Group>
    );
    processResult(surface, "snapshots/transform/scale-origin.png");
  });
  it("Scale with matrix and origin", () => {
    const size = width;
    const matrix = Skia.Matrix();
    const origin = Skia.Point(size / 2, size / 2);
    matrix.scale(0.5);
    const surface = drawOnNode(
      <Group matrix={matrix} origin={origin}>
        <Rect x={0} y={0} width={size} height={size} color="lightblue" />
      </Group>
    );
    processResult(surface, "snapshots/transform/scale-origin.png");
  });
});

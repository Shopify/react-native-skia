import React from "react";

import { processResult } from "../../__tests__/setup";
import { Patch } from "../components";
import * as SkiaRenderer from "../index";

import { drawOnNode, getSkia } from "./setup";

describe("CoonPatch", () => {
  it("Renderer", () => {
    expect(SkiaRenderer).toBeDefined();
  });
  it("Simple Coon Patch", () => {
    const vec = getSkia().Point;
    const colors = ["#61dafb", "#fb61da", "#61fbcf", "#dafb61"];
    const C = 64;
    const topLeft = { pos: vec(0, 0), c1: vec(C, 0), c2: vec(0, C) };
    const topRight = { pos: vec(256, 0), c1: vec(256 + C, 0), c2: vec(256, C) };
    const bottomRight = {
      pos: vec(256, 256),
      c1: vec(256 - 2 * C, 256),
      c2: vec(256, 256 - 2 * C),
    };
    const bottomLeft = {
      pos: vec(0, 256),
      c1: vec(-2 * C, 256),
      c2: vec(0, 256 - 2 * C),
    };
    const surface = drawOnNode(
      <Patch
        colors={colors}
        patch={[topLeft, topRight, bottomRight, bottomLeft]}
      />
    );
    processResult(surface, "snapshots/coon-patch/simple.png");
  });
});

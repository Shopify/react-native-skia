import React from "react";

import { surface } from "../setup";
import { Fill, Patch } from "../../components";
import * as SkiaRenderer from "../../index";
import { checkImage } from "../../../__tests__/setup";

describe("CoonsPatch", () => {
  it("Renderer", () => {
    expect(SkiaRenderer).toBeDefined();
  });
  it("Simple Coons Patch", async () => {
    const vec = (x: number, y: number) => ({ x, y });
    const colors = ["#61dafb", "#fb61da", "#61fbcf", "#dafb61"];
    const { width } = surface;
    const C = width / 4;
    const topLeft = { pos: vec(0, 0), c1: vec(0, C), c2: vec(C, 0) };
    const topRight = {
      pos: vec(width, 0),
      c1: vec(width, C),
      c2: vec(width + C, 0),
    };
    const bottomRight = {
      pos: vec(width, width),
      c1: vec(width, width - 2 * C),
      c2: vec(width - 2 * C, width),
    };
    const bottomLeft = {
      pos: vec(0, width),
      c1: vec(0, width - 2 * C),
      c2: vec(-2 * C, width),
    };
    const img = await surface.draw(
      <Patch
        colors={colors}
        patch={[topLeft, topRight, bottomRight, bottomLeft]}
      />
    );
    checkImage(img, "snapshots/coons-patch/simple.png");
  });
  it("Coons Patch with opacity", async () => {
    const vec = (x: number, y: number) => ({ x, y });
    const colors = ["#61dafb", "#fb61da", "#61fbcf", "#dafb61"];
    const { width } = surface;
    const C = width / 4;
    const topLeft = { pos: vec(0, 0), c1: vec(0, C), c2: vec(C, 0) };
    const topRight = {
      pos: vec(width, 0),
      c1: vec(width, C),
      c2: vec(width + C, 0),
    };
    const bottomRight = {
      pos: vec(width, width),
      c1: vec(width, width - 2 * C),
      c2: vec(width - 2 * C, width),
    };
    const bottomLeft = {
      pos: vec(0, width),
      c1: vec(0, width - 2 * C),
      c2: vec(-2 * C, width),
    };
    const img = await surface.draw(
      <>
        <Fill color="white" />
        <Patch
          colors={colors}
          patch={[topLeft, topRight, bottomRight, bottomLeft]}
          opacity={0.5}
        />
      </>
    );
    checkImage(img, "snapshots/coons-patch/patch-with-opacity.png");
  });
});

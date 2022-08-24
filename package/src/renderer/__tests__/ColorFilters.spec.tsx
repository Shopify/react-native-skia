import React from "react";

import { docPath, processResult } from "../../__tests__/setup";
import { BlendColor, Circle, ColorMatrix, Group, Image } from "../components";

import { drawOnNode, height, width, loadImage } from "./setup";

describe("Color Filters", () => {
  it("should apply a color matrix to an image", () => {
    const image = loadImage("skia/__tests__/assets/oslo.jpg");
    const surface = drawOnNode(
      <Image
        x={0}
        y={0}
        width={width}
        height={height}
        image={image}
        fit="cover"
      >
        <ColorMatrix
          matrix={[
            -0.578, 0.99, 0.588, 0, 0, 0.469, 0.535, -0.003, 0, 0, 0.015, 1.69,
            -0.703, 0, 0, 0, 0, 0, 1, 0,
          ]}
        />
      </Image>
    );
    processResult(surface, docPath("color-filters/color-matrix.png"));
  });
  it("should blend a color", () => {
    const r = width / 2;
    const surface = drawOnNode(
      <>
        <Group>
          <BlendColor color="cyan" mode="multiply" />
          <Circle cx={r} cy={r} r={r} color="yellow" />
          <Circle cx={2 * r} cy={r} r={r} color="magenta" />
        </Group>
      </>
    );
    processResult(surface, docPath("color-filters/color-blend.png"));
  });
});

import React from "react";

import { docPath, processResult } from "../../__tests__/setup";
import { ColorMatrix, Image } from "../components";

import { drawOnNode, height, width, loadImage } from "./setup";

describe("Color Filters", () => {
  it("apply a color Matrix to an image", () => {
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
});

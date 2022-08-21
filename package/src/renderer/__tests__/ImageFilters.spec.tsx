import React from "react";

import { docPath, processResult } from "../../__tests__/setup";
import { Fill, Image, Morphology, Offset, Text } from "../components";

import {
  drawOnNode,
  loadFont,
  fontSize,
  loadImage,
  width,
  height,
} from "./setup";

describe("Test Image Filters", () => {
  it("Should change the text morphology", () => {
    const font = loadFont("skia/__tests__/assets/Roboto-Medium.ttf", fontSize);
    const surface = drawOnNode(
      <>
        <Fill color="white" />
        <Text text="Hello World" x={96} y={96} font={font} />
        <Text text="Hello World" x={96} y={192} font={font}>
          <Morphology radius={3} />
        </Text>
        <Text text="Hello World" x={96} y={288} font={font}>
          <Morphology radius={1} operator="erode" />
        </Text>
      </>
    );
    processResult(surface, docPath("image-filters/morphology.png"));
  });
  it("Should offset the image", () => {
    const image = loadImage("skia/__tests__/assets/oslo.jpg");
    const surface = drawOnNode(
      <>
        <Fill color="lightblue" />
        <Image
          image={image}
          x={0}
          y={0}
          width={width}
          height={height}
          fit="cover"
        >
          <Offset x={192} y={192} />
        </Image>
      </>
    );
    processResult(surface, docPath("image-filters/offset.png"));
  });
});

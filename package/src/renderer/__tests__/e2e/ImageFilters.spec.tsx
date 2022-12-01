import React from "react";

import { docPath, checkImage, itRunsE2eOnly } from "../../../__tests__/setup";
import { surface, loadImage, loadFont } from "../setup";
import {
  Fill,
  Image,
  Morphology,
  Offset,
  RoundedRect,
  Shadow,
  Text,
} from "../../components";
import type { SkImage, SkFont } from "../../../skia/types";

let oslo: SkImage;
let font: SkFont;
const assets = new Map<SkImage | SkFont, string>();

beforeAll(() => {
  const { fontSize } = surface;
  font = loadFont("skia/__tests__/assets/Roboto-Medium.ttf", fontSize);
  oslo = loadImage("skia/__tests__/assets/oslo.jpg");
  assets.set(oslo, "oslo");
  assets.set(font, "Roboto-Medium");
});

describe("Test Image Filters", () => {
  itRunsE2eOnly("Should display the text the same way everywhere", async () => {
    const { width } = surface;
    const x = width / 8;
    const image = await surface.draw(
      <>
        <Fill color="white" />
        <Text text="Hello World" x={x} y={x} font={font} />
      </>,
      assets
    );
    checkImage(image, docPath("image-filters/regular-text.png"));
  });
  itRunsE2eOnly("Should change the text morphology", async () => {
    const { width } = surface;
    const x = width / 8;
    const y = x;
    const y1 = 2 * y;
    const y2 = 3 * y;
    const image = await surface.draw(
      <>
        <Fill color="white" />
        <Text text="Hello World" x={x} y={y} font={font} />
        <Text text="Hello World" x={x} y={y1} font={font}>
          <Morphology radius={1} />
        </Text>
        <Text text="Hello World" x={x} y={y2} font={font}>
          <Morphology radius={0.3} operator="erode" />
        </Text>
      </>,
      assets
    );
    checkImage(image, docPath("image-filters/morphology.png"));
  });
  it("Should offset the image", async () => {
    const { width, height } = surface;
    const img = await surface.draw(
      <>
        <Fill color="lightblue" />
        <Image
          image={oslo}
          x={0}
          y={0}
          width={width}
          height={height}
          fit="cover"
        >
          <Offset x={width / 4} y={width / 4} />
        </Image>
      </>,
      assets
    );
    checkImage(img, docPath("image-filters/offset.png"));
  });
  // This test should fail because it is not scaled properly but
  // it passes because of the low tolerance in the canvas result
  it("Should draw a dropshadow", async () => {
    const { width } = surface;
    const padding = width / 8;
    const img = await surface.draw(
      <>
        <Fill color="lightblue" />
        <RoundedRect
          x={padding}
          y={padding}
          width={width - 2 * padding}
          height={width - 2 * padding}
          r={padding}
          color="lightblue"
        >
          <Shadow dx={36 / 3} dy={36 / 3} blur={75 / 3} color="#93b8c4" />
          <Shadow dx={-36 / 3} dy={-36 / 3} blur={75 / 3} color="#c7f8ff" />
        </RoundedRect>
      </>
    );
    checkImage(img, docPath("image-filters/dropshadow.png"));
  });
  // This test should fail because it is not scaled properly but
  // it passes because of the low tolerance in the canvas result
  it("Should draw a innershadow", async () => {
    const { width } = surface;
    const padding = width / 8;
    const img = await surface.draw(
      <>
        <Fill color="lightblue" />
        <RoundedRect
          x={padding}
          y={padding}
          width={width - 2 * padding}
          height={width - 2 * padding}
          r={padding}
          color="lightblue"
        >
          <Shadow dx={36 / 3} dy={36 / 3} blur={75 / 3} color="#93b8c4" inner />
          <Shadow
            dx={-36 / 3}
            dy={-36 / 3}
            blur={75 / 3}
            color="#c7f8ff"
            inner
          />
        </RoundedRect>
      </>
    );
    checkImage(img, docPath("image-filters/innershadow.png"));
  });
});

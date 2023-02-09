import React from "react";

import { docPath, checkImage, itRunsNodeOnly } from "../../../__tests__/setup";
import { fonts, images, surface } from "../setup";
import {
  Fill,
  Image,
  Morphology,
  Offset,
  RoundedRect,
  Shadow,
  Text,
} from "../../components";

describe("Test Image Filters", () => {
  itRunsNodeOnly(
    "Should display the text the same way everywhere",
    async () => {
      const font = fonts.RobotoMedium;
      const { width } = surface;
      const x = width / 8;
      const image = await surface.draw(
        <>
          <Fill color="white" />
          <Text text="Hello World" x={x} y={x} font={font} />
        </>
      );
      checkImage(image, docPath("image-filters/regular-text.png"));
    }
  );
  itRunsNodeOnly("Should change the text morphology", async () => {
    const font = fonts.RobotoMedium;
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
      </>
    );
    checkImage(image, docPath("image-filters/morphology.png"));
  });
  it("Should offset the image", async () => {
    const { oslo } = images;
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
      </>
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
    checkImage(img, docPath("image-filters/dropshadow.png"), {
      threshold: 0.05,
    });
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
    checkImage(img, docPath("image-filters/innershadow.png"), {
      threshold: 0.05,
    });
  });
  it("should show outer and inner shadows on text", async () => {
    const { width } = surface;
    const title = "Nice Job!";
    const img = await surface.draw(
      <>
        <Fill color="#add8e6" />
        <Text
          color="red"
          font={fonts.RobotoMedium}
          text={title}
          x={width / 2 - fonts.RobotoMedium.getTextWidth(title) / 2}
          y={50}
        >
          <Shadow dx={0} dy={4} blur={1} color="#00FF00" inner />
          <Shadow dx={0} dy={4} blur={0} color="#0000ff" />
        </Text>
      </>
    );
    checkImage(img, "snapshots/image-filter/text-shadow.png");
  });
});

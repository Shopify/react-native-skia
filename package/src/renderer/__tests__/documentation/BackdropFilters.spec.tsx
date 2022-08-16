import React from "react";

import { docPath, processResult } from "../../../__tests__/setup";
import {
  BackdropBlur,
  BackdropFilter,
  ColorMatrix,
  Fill,
  Image,
} from "../../components";
import { drawOnNode, width, loadImage } from "../setup";
import { Group } from "../../components/Group";

const size = width;
// https://kazzkiq.github.io/svg-color-filter/
const BLACK_AND_WHITE = [
  0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0,
];

describe("Backdrop Filters", () => {
  it("A black and white color filter as backdrop color filter", () => {
    const image = loadImage("skia/__tests__/assets/oslo.jpg")!;
    expect(image).toBeTruthy();
    const surface = drawOnNode(
      <Group>
        <Image
          image={image}
          x={0}
          y={0}
          width={width}
          height={width}
          fit="cover"
        />
        <BackdropFilter
          clip={{ x: 0, y: size / 2, width: size, height: size / 2 }}
          filter={<ColorMatrix matrix={BLACK_AND_WHITE} />}
        />
      </Group>
    );
    processResult(surface, docPath("black-and-white-backdrop-filter.png"));
  });
  it("Blur backdrop filter", () => {
    const image = loadImage("skia/__tests__/assets/oslo.jpg")!;
    expect(image).toBeTruthy();
    const surface = drawOnNode(
      <Group>
        <Image
          image={image}
          x={0}
          y={0}
          width={width}
          height={width}
          fit="cover"
        />
        <BackdropBlur
          blur={4}
          clip={{ x: 0, y: size / 2, width: size, height: size / 2 }}
        >
          <Fill color="rgba(0, 0, 0, 0.2)" />
        </BackdropBlur>
      </Group>
    );
    processResult(surface, docPath("blur-backdrop-filter.png"));
  });
});

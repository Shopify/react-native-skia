import React from "react";

import { loadImage, surface } from "../setup";
import {
  BlendColor,
  Circle,
  ColorMatrix,
  Group,
  Image,
  Lerp,
  LinearToSRGBGamma,
  SRGBToLinearGamma,
} from "../../components";
import { docPath, checkImage, itRunsE2eOnly } from "../../../__tests__/setup";

describe("Color Filters", () => {
  it("should apply a color matrix to an image", async () => {
    const image = loadImage("skia/__tests__/assets/oslo.jpg");
    const { width, height } = surface;
    const img = await surface.draw(
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
    checkImage(img, docPath("color-filters/color-matrix.png"));
  });
  it("should blend a color", async () => {
    const { width } = surface;
    const r = width / 2;
    const img = await surface.draw(
      <>
        <Group>
          <BlendColor color="cyan" mode="multiply" />
          <Circle cx={r} cy={r} r={r} color="yellow" />
          <Circle cx={2 * r} cy={r} r={r} color="magenta" />
        </Group>
      </>
    );
    checkImage(img, docPath("color-filters/color-blend.png"));
  });
  it("should use composition", async () => {
    const { width } = surface;
    const r = width / 2;
    const img = await surface.draw(
      <Group>
        <SRGBToLinearGamma>
          <BlendColor color="lightblue" mode="srcIn" />
        </SRGBToLinearGamma>
        <Circle cx={r} cy={r} r={r} />
        <Circle cx={2 * r} cy={r} r={r} color="red" />
      </Group>
    );
    checkImage(img, docPath("color-filters/composition.png"));
  });
  itRunsE2eOnly("should use basic linear interpolation", async () => {
    const { width, height } = surface;
    const image = loadImage("skia/__tests__/assets/oslo.jpg");
    const blackAndWhite = [
      0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0,
    ];
    const identity = [
      1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 0.0, 1.0, 0.0,
    ];
    let img = await surface.draw(
      <>
        <Image
          x={0}
          y={0}
          width={width}
          height={height}
          image={image}
          fit="cover"
        >
          <LinearToSRGBGamma>
            <Lerp t={0.5}>
              <ColorMatrix matrix={identity} />
              <ColorMatrix matrix={blackAndWhite} />
            </Lerp>
          </LinearToSRGBGamma>
        </Image>
      </>
    );
    checkImage(img, docPath("color-filters/simple-lerp.png"));
    img = await surface.draw(
      <>
        <Image
          x={0}
          y={0}
          width={width}
          height={height}
          image={image}
          fit="cover"
        >
          <LinearToSRGBGamma>
            <Lerp t={0.5}>
              <ColorMatrix matrix={blackAndWhite} />
              <ColorMatrix matrix={identity} />
            </Lerp>
          </LinearToSRGBGamma>
        </Image>
      </>
    );
    checkImage(img, docPath("color-filters/simple-lerp.png"));
    img = await surface.draw(
      <>
        <Image
          x={0}
          y={0}
          width={width}
          height={height}
          image={image}
          fit="cover"
        >
          <LinearToSRGBGamma>
            <Lerp t={0}>
              <ColorMatrix matrix={blackAndWhite} />
              <ColorMatrix matrix={identity} />
            </Lerp>
          </LinearToSRGBGamma>
        </Image>
      </>
    );
    checkImage(img, docPath("color-filters/black-and-white.png"));
  });
  itRunsE2eOnly(
    "should use linear interpolation between two color matrices",
    async () => {
      const { width, height } = surface;
      const image = loadImage("skia/__tests__/assets/oslo.jpg");
      const blackAndWhite = [
        0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0,
      ];
      const purple = [
        1, -0.2, 0, 0, 0, 0, 1, 0, -0.1, 0, 0, 1.2, 1, 0.1, 0, 0, 0, 1.7, 1, 0,
      ];
      const img = await surface.draw(
        <>
          <Image
            x={0}
            y={0}
            width={width}
            height={height}
            image={image}
            fit="cover"
          >
            <LinearToSRGBGamma>
              <Lerp t={0.5}>
                <ColorMatrix matrix={purple} />
                <ColorMatrix matrix={blackAndWhite} />
              </Lerp>
            </LinearToSRGBGamma>
          </Image>
        </>
      );
      checkImage(img, docPath("color-filters/lerp.png"));
    }
  );
});

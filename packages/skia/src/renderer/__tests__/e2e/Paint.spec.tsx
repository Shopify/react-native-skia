/* eslint-disable max-len */
import React from "react";

import { surface, importSkia } from "../setup";
import {
  Circle,
  Fill,
  Group,
  LinearGradient,
  Paint,
  Path,
} from "../../components";
import { checkImage } from "../../../__tests__/setup";
import { fitbox } from "../../components/shapes/FitBox";

const blendModes = [
  "clear",
  "src",
  "dst",
  "srcOver",
  "dstOver",
  "srcIn",
  "dstIn",
  "srcOut",
  "dstOut",
  "srcATop",
  "dstATop",
  "xor",
  "plus",
  "modulate",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "colorDodge",
  "colorBurn",
  "hardLight",
  "softLight",
  "difference",
  "exclusion",
  "multiply",
  "hue",
  "saturation",
  "color",
  "luminosity",
] as const;

const SIZE = 32;
const COLS = 256 / SIZE;

describe("Paint", () => {
  it("should interpret the #rrggbbaa correctly", async () => {
    const { width, height } = surface;
    const { rect } = importSkia();
    const image = await surface.draw(
      <>
        <Group clip={rect(0, 0, width / 2, height)}>
          <Fill color="#ff000079" />
        </Group>
        <Group clip={rect(width / 2, 0, width / 2, height)}>
          <Fill color="#ff000080" />
        </Group>
      </>
    );
    checkImage(image, "snapshots/paint/colors.png");
  });
  it("should accept a paint object as property", async () => {
    const { width, height } = surface;
    const { Skia } = importSkia();
    const paint = Skia.Paint();
    paint.setColor(Skia.Color("lightblue"));
    const image = await surface.draw(
      <Group>
        <Circle
          cx={width / 2}
          cy={height / 2}
          r={width / 2}
          paint={paint}
          color="red"
        />
      </Group>
    );
    checkImage(image, "snapshots/paint/circle.png");
  });
  it("should accept a paint object as path property", async () => {
    const { Skia } = importSkia();
    const paint = Skia.Paint();
    paint.setColor(Skia.Color("lightblue"));
    const image = await surface.draw(
      <Group>
        <Path path="M0 0h100v100H0z" paint={paint} color="red" />
      </Group>
    );
    checkImage(image, "snapshots/paint/path-paint.png");
  });
  it("should display blend modes properly", async () => {
    const { Skia, rect } = importSkia();
    const src = Skia.Path.MakeFromSVGString(
      [
        "M170.699 148.614C135.228 184.085 100.799 213.726 74.0057 232.813C90.1873 241.166 108.534 245.913 127.998 245.913C193.121 245.913 245.909 193.124 245.909 128.001C245.909 110.165 241.926 93.2652 234.837 78.1096C217.359 99.6154 195.456 123.859 170.699 148.615V148.614Z",
        "M254.299 1.69725C247.995 -4.60656 225.09 7.01991 194.111 30.4188C175.254 17.6079 152.513 10.089 127.998 10.089C62.8758 10.089 10.0869 62.8778 10.0869 128C10.0869 152.517 17.6079 175.254 30.4188 194.113C7.01991 225.094 -4.60656 248.001 1.69725 254.301C13.1117 265.715 78.9083 218.421 148.663 148.666C218.418 78.9109 265.715 13.1111 254.298 1.69986L254.299 1.69725Z",
      ].join(" ")
    )!;
    const dst = Skia.Path.MakeFromSVGString(
      [
        "M3.75337 3.75477C10.8647 -3.35674 92.9919 -5.28784 142.454 44.1778C154.016 55.7403 163.904 67.9247 171.948 80.1734L208.991 81.7669L256 128.773L195.968 145.267C196.467 160.332 192.34 173.419 182.882 182.88C173.423 192.338 160.334 196.467 145.27 195.967L128.776 256L81.7688 208.991L80.1773 171.946C67.9284 163.902 55.7442 154.012 44.1825 142.451C-5.28603 92.9918 -3.359 10.8662 3.75637 3.75272L3.75337 3.75477ZM48.1571 79.8283C56.9032 88.5745 71.0812 88.5745 79.8252 79.8283C88.5712 71.0821 88.5712 56.9038 79.8252 48.1595C71.0791 39.4133 56.9012 39.4133 48.1571 48.1595C39.4111 56.9038 39.4111 71.0841 48.1571 79.8283Z",
        "M195.01 222.191C184.687 211.867 183.417 199.108 191.258 191.264C199.098 183.425 211.857 184.692 222.184 195.017C235.86 208.692 242.751 238.822 240.785 240.789C238.817 242.759 208.688 235.867 195.01 222.191Z",
      ].join(" ")
    )!;
    expect(src).toBeDefined();
    expect(dst).toBeDefined();
    const srcBox = src.computeTightBounds();
    const dstBox = dst.computeTightBounds();
    const img = await surface.draw(
      <>
        {blendModes.map((blendMode, i) => {
          return (
            <Group
              transform={[
                { translateX: SIZE * (i % COLS) },
                { translateY: SIZE * Math.floor(i / COLS) },
              ]}
              key={blendMode}
              layer
            >
              <Path
                path={dst}
                transform={fitbox("contain", dstBox, rect(0, 0, SIZE, SIZE))}
                color="pink"
              />
              <Group layer={<Paint blendMode={blendMode} />}>
                <Path
                  path={src}
                  color="lightblue"
                  transform={fitbox("contain", srcBox, rect(0, 0, SIZE, SIZE))}
                />
              </Group>
            </Group>
          );
        })}
      </>
    );
    checkImage(img, "snapshots/paint/blend-mode.png");
  });
  it("Dithering", async () => {
    const { height } = surface;
    const { vec } = importSkia();
    const c1 = "#202225ff";
    const c2 = "#141619FF";
    async function drawGradientWithDither(dither: boolean) {
      return surface.draw(
        <Fill dither={dither}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, height)}
            colors={[c1, c2]}
          />
        </Fill>
      );
    }
    const withDither = await drawGradientWithDither(true);
    const withoutDither = await drawGradientWithDither(false);
    checkImage(withDither, "snapshots/paint/dither.png");
    checkImage(withoutDither, "snapshots/paint/without-dither.png");
    checkImage(withoutDither, "snapshots/paint/dither.png", {
      shouldFail: true,
      threshold: 0,
    });
  });
});

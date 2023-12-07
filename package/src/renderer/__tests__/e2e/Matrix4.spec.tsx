import React from "react";

import { checkImage } from "../../../__tests__/setup";
import { Group, Rect } from "../../components";
import { importSkia, surface } from "../setup";
import { processTransform3d } from "../../../skia/types";

const toMatrix3 = (m: number[]) => {
  return [m[0], m[1], m[3], m[4], m[5], m[7], m[12], m[13], m[15]];
};

const perspective = (d: number) => [
  1,
  0,
  0,
  0,
  0,
  1,
  0,
  0,
  0,
  0,
  1,
  0,
  0,
  0,
  -1 / d,
  1,
];

const concat = (a: number[], b: number[]) => CanvasKit.M44.multiply(a, b);

describe("Matrix4", () => {
  it("should be a row major matix", () => {
    const m4 = CanvasKit.M44.identity();
    expect(processTransform3d([])).toEqual(toMatrix3(m4));
  });
  it("should match identity matrix", () => {
    const m4 = CanvasKit.M44.identity();
    expect(
      processTransform3d([
        { translateX: 256 / 2 },
        { translateY: 256 / 2 },
        { translateX: -256 / 2 },
        { translateY: -256 / 2 },
      ])
    ).toEqual(toMatrix3(m4));
  });
  it("Identity should match identity matrix", () => {
    const m4 = CanvasKit.M44.identity();
    expect(
      processTransform3d([
        { translateX: 256 / 2 },
        { translateY: 256 / 2 },
        { translateX: -256 / 2 },
        { translateY: -256 / 2 },
      ])
    ).toEqual(toMatrix3(m4));
  });
  it("should match perspective matrix", () => {
    let m4 = CanvasKit.M44.identity();
    m4 = concat(m4, CanvasKit.M44.translated([256 / 2, 256 / 2, 0]));
    m4 = concat(m4, perspective(300));
    m4 = concat(m4, CanvasKit.M44.translated([-256 / 2, -256 / 2, 0]));
    expect(
      processTransform3d([
        { translateX: 256 / 2 },
        { translateY: 256 / 2 },
        { perspective: 300 },
        { translateX: -256 / 2 },
        { translateY: -256 / 2 },
      ])
    ).toEqual(toMatrix3(m4));
  });
  it("should match rotation matrix (1)", () => {
    let m4 = CanvasKit.M44.identity();
    m4 = concat(m4, CanvasKit.M44.rotated([1, 0, 0], 1));
    expect(processTransform3d([{ rotateX: 1 }])).toEqual(toMatrix3(m4));
    m4 = CanvasKit.M44.identity();
    m4 = concat(m4, CanvasKit.M44.rotated([0, 1, 0], Math.PI));
    expect(processTransform3d([{ rotateY: Math.PI }])).toEqual(toMatrix3(m4));
  });
  it("should match rotation matrix (2)", () => {
    let m4 = CanvasKit.M44.identity();
    m4 = concat(m4, CanvasKit.M44.translated([256 / 2, 256 / 2, 0]));
    m4 = concat(m4, CanvasKit.M44.rotated([1, 0, 0], 1));
    m4 = concat(m4, CanvasKit.M44.translated([-256 / 2, -256 / 2, 0]));
    expect(
      processTransform3d([
        { translateX: 256 / 2 },
        { translateY: 256 / 2 },
        { rotateX: 1 },
        { translateX: -256 / 2 },
        { translateY: -256 / 2 },
      ])
    ).toEqual(toMatrix3(m4));
  });
  it("Should do a perspective transformation", async () => {
    const { Skia } = importSkia();
    const { width, height } = surface;
    const pad = 32;
    const rct = {
      x: pad,
      y: pad,
      width: width - pad * 2,
      height: height - pad * 2,
    };
    // todo: accept { translate: [width/2, height/2] }
    const m3 = Skia.Matrix(
      processTransform3d([
        { translateX: width / 2 },
        { translateY: height / 2 },
        { perspective: 300 },
        { rotateX: 1 },
        { translateX: -width / 2 },
        { translateY: -height / 2 },
      ])
    );

    const image = await surface.draw(
      <Group>
        <Rect rect={rct} color="magenta" />
        <Rect rect={rct} color="cyan" opacity={0.5} matrix={m3} />
      </Group>
    );
    checkImage(image, "snapshots/matrix4/perspective.png");
  });
});

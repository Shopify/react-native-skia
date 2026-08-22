import React from "react";

import { importSkia } from "../../renderer/__tests__/setup";
import type { SkImage } from "../../skia/types";
import { SkiaSGRoot } from "../Reconciler";

const SIZE = 256;
const Y = SIZE / 2;

const alphaAt = (image: SkImage, x: number, y: number) => {
  const pixels = image.readPixels() as Uint8Array;
  return pixels[(y * image.width() + x) * 4 + 3];
};

// A horizontal line trimmed to its first half. The `stroke` prop turns the
// path into its own outline, so the trim has to run first to mean anything.
const drawTrimmedLine = async () => {
  const { Skia } = importSkia();
  const root = new SkiaSGRoot(Skia);
  await root.render(
    <skPath
      path="M 20 128 L 236 128"
      color="red"
      stroke={{ width: 20 }}
      start={0}
      end={0.5}
    />
  );
  const surface = Skia.Surface.Make(SIZE, SIZE)!;
  root.drawOnCanvas(surface.getCanvas());
  surface.flush();
  const image = surface.makeImageSnapshot();
  root.unmount();
  return image;
};

describe("Path trim", () => {
  it("trims the path before turning it into a stroke outline", async () => {
    const image = await drawTrimmedLine();
    expect(alphaAt(image, 60, Y)).toBe(255);
    expect(alphaAt(image, 200, Y)).toBe(0);
  });
});

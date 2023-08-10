import React from "react";

import { checkImage } from "../../../__tests__/setup";
import { images, surface } from "../setup";
import { Fill, Image as SkiaImage } from "../../components";

describe("Image loading from bundles", () => {
  it("should render png, jpg from bundle", async () => {
    const { width } = surface;
    const size = width * 0.45;
    const bundlePng = images.skiaLogoPng;
    const bundleJpeg = images.skiaLogoJpeg;
    const image = await surface.draw(
      <>
        <Fill color="white" />
        <SkiaImage image={bundlePng} width={size} height={size} />
        <SkiaImage
          image={bundleJpeg}
          width={size}
          height={size}
          x={width / 2}
        />
      </>
    );
    checkImage(image, `snapshots/images/bundle-${surface.OS}.png`);
  });
  // This test should only run on CI because it will trigger a redbox.
  // While this is fine on CI, it is undesirable on local dev.
  // it("should not crash with an invalid viewTag", async () => {
  //   const result = await surface.eval((Skia) => {
  //     Skia.Image.MakeImageFromViewTag(-1);
  //     return true;
  //   });
  //   expect(result).toBe(true);
  // });
});

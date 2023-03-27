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
});

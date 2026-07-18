import React from "react";

import { checkImage } from "../../../__tests__/setup";
import { dataAssets, images, loadImage, surface } from "../setup";
import { Fill, Image as SkiaImage } from "../../components";
import { AlphaType, ColorType } from "../../../skia/types";

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

  it("should read pixels from an image", async () => {
    const pixels = await surface.eval(
      (Skia, { data }) => {
        const image = Skia.Image.MakeImageFromEncoded(
          Skia.Data.fromBytes(new Uint8Array(data))
        )!;
        return Array.from(
          image.readPixels(0, 0, {
            width: 2,
            height: 2,
            colorType: image.getImageInfo().colorType,
            alphaType: image.getImageInfo().alphaType,
          })!
        );
      },
      {
        data: Array.from(
          loadImage("skia/__tests__/assets/oslo-mini.jpg").encodeToBytes()
        ),
      }
    );
    expect(pixels).toBeDefined();
    expect(pixels).toEqual([
      171, 188, 198, 255, 171, 188, 198, 255, 171, 188, 198, 255, 171, 188, 198,
      255,
    ]);
  });

  it("should decode an encoded image at a reduced resolution", async () => {
    const dimensions = await surface.eval(
      (Skia, { data }) => {
        const encoded = Skia.Data.fromBytes(new Uint8Array(data));
        const fullSize = Skia.Image.MakeImageFromEncoded(encoded)!;
        const scaled = Skia.Image.MakeImageFromEncodedScaled(
          encoded,
          fullSize.width() / 2,
          fullSize.height() / 2
        )!;
        return {
          fullWidth: fullSize.width(),
          fullHeight: fullSize.height(),
          scaledWidth: scaled.width(),
          scaledHeight: scaled.height(),
        };
      },
      { data: Array.from(dataAssets.img_0) }
    );

    expect(dimensions.scaledWidth).toBeLessThan(dimensions.fullWidth);
    expect(dimensions.scaledHeight).toBeLessThan(dimensions.fullHeight);
    expect(dimensions.scaledWidth / dimensions.scaledHeight).toBeCloseTo(
      dimensions.fullWidth / dimensions.fullHeight,
      1
    );
  });

  it("should reject non-positive scaled decode dimensions", async () => {
    const result = await surface.eval(
      (Skia, { data }) => {
        const encoded = Skia.Data.fromBytes(new Uint8Array(data));
        return {
          width: Skia.Image.MakeImageFromEncodedScaled(encoded, 0) === null,
          height:
            Skia.Image.MakeImageFromEncodedScaled(encoded, 100, -1) === null,
        };
      },
      { data: Array.from(dataAssets.img_0) }
    );

    expect(result).toEqual({ width: true, height: true });
  });

  it("should read pixels from a canvas", async () => {
    const pixels = await surface.eval(
      (Skia, { colorType, alphaType }) => {
        const offscreen = Skia.Surface.MakeOffscreen(10, 10)!;
        const canvas = offscreen.getCanvas();
        canvas.drawColor(Skia.Color("red"));
        return Array.from(
          canvas.readPixels(0, 0, {
            width: 1,
            height: 1,
            colorType,
            alphaType,
          })!
        );
      },
      { colorType: ColorType.RGBA_8888, alphaType: AlphaType.Unpremul }
    );
    expect(pixels).toBeDefined();
    expect(Array.from(pixels!)).toEqual([255, 0, 0, 255]);
  });
});

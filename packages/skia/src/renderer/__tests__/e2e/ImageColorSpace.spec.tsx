import { ColorSpace } from "../../../skia/types";
import { ColorType } from "../../../skia/types/Image/ColorType";
import { AlphaType } from "../../../skia/types/Image/ImageFactory";
import { surface } from "../setup";

describe("Image ColorSpace + 16-bit pixel data", () => {
  it("MakeImage with RGBA_F16 + display-p3-linear returns a valid image", async () => {
    const result = await surface.eval(
      (Skia, ctx) => {
        const width = 8;
        const height = 8;
        // 4 channels x 2 bytes per channel (half float) = 8 bytes per pixel.
        const bytesPerRow = width * 8;
        const bytes = new Uint8Array(bytesPerRow * height);
        const data = Skia.Data.fromBytes(bytes);
        const image = Skia.Image.MakeImage(
          {
            width,
            height,
            colorType: ctx.colorType,
            alphaType: ctx.alphaType,
            colorSpace: ctx.colorSpace,
          },
          data,
          bytesPerRow
        );
        if (!image) {
          return null;
        }
        const info = image.getImageInfo();
        return {
          width: image.width(),
          height: image.height(),
          colorType: info.colorType,
          alphaType: info.alphaType,
          colorSpace: info.colorSpace ?? null,
        };
      },
      {
        colorType: ColorType.RGBA_F16,
        alphaType: AlphaType.Premul,
        colorSpace: ColorSpace.DisplayP3Linear,
      }
    );
    expect(result).not.toBeNull();
    expect(result!.width).toBe(8);
    expect(result!.height).toBe(8);
    expect(result!.colorType).toBe(ColorType.RGBA_F16);
    expect(result!.alphaType).toBe(AlphaType.Premul);
    // Native iOS round-trips the color space identifier. CanvasKit cannot
    // surface it from getImageInfo, so we accept null or the matching string.
    if (result!.colorSpace !== null) {
      expect(result!.colorSpace).toBe(ColorSpace.DisplayP3Linear);
    }
  });

  it("MakeImage with default 8-bit RGBA_8888 still works (no colorSpace)", async () => {
    const result = await surface.eval(
      (Skia, ctx) => {
        const width = 4;
        const height = 4;
        const bytesPerRow = width * 4;
        const bytes = new Uint8Array(bytesPerRow * height);
        const data = Skia.Data.fromBytes(bytes);
        const image = Skia.Image.MakeImage(
          {
            width,
            height,
            colorType: ctx.colorType,
            alphaType: ctx.alphaType,
          },
          data,
          bytesPerRow
        );
        if (!image) {
          return null;
        }
        return { width: image.width(), height: image.height() };
      },
      {
        colorType: ColorType.RGBA_8888,
        alphaType: AlphaType.Premul,
      }
    );
    expect(result).not.toBeNull();
    expect(result!.width).toBe(4);
    expect(result!.height).toBe(4);
  });
});

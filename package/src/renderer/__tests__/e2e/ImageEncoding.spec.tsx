import { surface } from "../setup";

const MAGIC_BYTES = {
  JPEG: "/9j/4",
  PNG: "iVBORw0KGgo",
  WEBP: "UklGR",
};

const IMAGE_FORMAT = {
  JPEG: 3, // ImageFormat.JPEG,
  PNG: 4, // ImageFormat.PNG,
  WEBP: 6, // ImageFormat.WEBP,
};

const IMAGE_INFO_BASE = {
  alphaType: 1, // AlphaType.Opaque,
  colorType: 4, // ColorType.RGBA_8888,
};

describe("Image Encoding", () => {
  it("SkImage.encodeToBase64: check WEBP format by magic bytes sequence UklGR...", async () => {
    const result = await surface.eval(
      (Skia, ctx) => {
        const width = 1;
        const height = 1;
        const bytesPerPixel = 4;
        const bytes = new Uint8Array(width * height * bytesPerPixel);
        bytes.fill(255);
        const data = Skia.Data.fromBytes(bytes);
        const imageInfo = {
          ...ctx.imageInfoBase,
          width,
          height,
        };

        return Skia.Image.MakeImage(imageInfo, data, width * bytesPerPixel)!
          .encodeToBase64(ctx.format)
          .slice(0, ctx.cutIndex);
      },
      {
        cutIndex: MAGIC_BYTES.WEBP.length,
        imageInfoBase: IMAGE_INFO_BASE,
        format: IMAGE_FORMAT.WEBP,
      }
    );

    expect(result).toEqual(MAGIC_BYTES.WEBP);
  });

  it("SkImage.encodeToBase64: check PNG format by magic bytes sequence iVBORw0KGgo...", async () => {
    const result = await surface.eval(
      (Skia, ctx) => {
        const width = 1;
        const height = 1;
        const bytesPerPixel = 4;
        const bytes = new Uint8Array(width * height * bytesPerPixel);
        bytes.fill(255);
        const data = Skia.Data.fromBytes(bytes);
        const imageInfo = {
          ...ctx.imageInfoBase,
          width,
          height,
        };

        return Skia.Image.MakeImage(imageInfo, data, width * bytesPerPixel)!
          .encodeToBase64(ctx.format)
          .slice(0, ctx.cutIndex);
      },
      {
        cutIndex: MAGIC_BYTES.PNG.length,
        imageInfoBase: IMAGE_INFO_BASE,
        format: IMAGE_FORMAT.PNG,
      }
    );

    expect(result).toEqual(MAGIC_BYTES.PNG);
  });

  it("SkImage.encodeToBase64: check JPEG format by magic bytes sequence /9j/4...", async () => {
    const result = await surface.eval(
      (Skia, ctx) => {
        const width = 1;
        const height = 1;
        const bytesPerPixel = 4;
        const bytes = new Uint8Array(width * height * bytesPerPixel);
        bytes.fill(255);
        const data = Skia.Data.fromBytes(bytes);
        const imageInfo = {
          ...ctx.imageInfoBase,
          width,
          height,
        };

        return Skia.Image.MakeImage(imageInfo, data, width * bytesPerPixel)!
          .encodeToBase64(ctx.format)
          .slice(0, ctx.cutIndex);
      },
      {
        cutIndex: MAGIC_BYTES.JPEG.length,
        imageInfoBase: IMAGE_INFO_BASE,
        format: IMAGE_FORMAT.JPEG,
      }
    );

    expect(result).toEqual(MAGIC_BYTES.JPEG);
  });

  it('SkImage.encodeToBase64: JPEG checking of the "quality" argument work', async () => {
    const result = await surface.eval(
      (Skia, ctx) => {
        const width = 1024;
        const height = 1024;
        const bytesPerPixel = 4;
        const bytes = new Uint8Array(width * height * bytesPerPixel);
        bytes.fill(255);
        let i = 0;
        for (let x = 0; x < 256; x++) {
          for (let y = 0; y < 256; y++) {
            bytes[i++] = (x * y) % 255;
          }
        }
        const data = Skia.Data.fromBytes(bytes);
        const imageInfo = {
          ...ctx.imageInfoBase,
          width,
          height,
        };
        const image = Skia.Image.MakeImage(
          imageInfo,
          data,
          width * bytesPerPixel
        )!;
        const minQuality = image.encodeToBase64(ctx.format, 0).length;
        const midQuality = image.encodeToBase64(ctx.format, 50).length;
        const defaultQuality = image.encodeToBase64(ctx.format).length; // default quality: 100.
        const maxQuality = image.encodeToBase64(ctx.format, 100).length;

        return {
          minQuality,
          midQuality,
          defaultQuality,
          maxQuality,
        };
      },
      { imageInfoBase: IMAGE_INFO_BASE, format: IMAGE_FORMAT.JPEG }
    );

    expect(result.minQuality).toBeLessThan(result.maxQuality);
    expect(result.minQuality).toBeLessThan(result.defaultQuality);
    expect(result.minQuality).toBeLessThan(result.midQuality);
    expect(result.midQuality).toBeLessThan(result.maxQuality);
    expect(result.defaultQuality).toEqual(result.maxQuality);
  });

  // this test can be failed on CanvasKit
  it('SkImage.encodeToBase64: PNG checking of the "quality" argument work', async () => {
    const result = await surface.eval(
      (Skia, ctx) => {
        const width = 1024;
        const height = 1024;
        const bytesPerPixel = 4;
        const bytes = new Uint8Array(width * height * bytesPerPixel);
        let i = 0;
        for (let x = 0; x < 256; x++) {
          for (let y = 0; y < 256; y++) {
            bytes[i++] = (x * y) % 255;
          }
        }
        const data = Skia.Data.fromBytes(bytes);
        const imageInfo = {
          ...ctx.imageInfoBase,
          width,
          height,
        };
        const image = Skia.Image.MakeImage(
          imageInfo,
          data,
          width * bytesPerPixel
        )!;
        const minQuality = image.encodeToBase64(ctx.format, 0).length;
        const midQuality = image.encodeToBase64(ctx.format, 50).length;
        const defaultQuality = image.encodeToBase64(ctx.format).length; // default quality: 100.
        const maxQuality = image.encodeToBase64(ctx.format, 100).length;

        return {
          minQuality,
          midQuality,
          defaultQuality,
          maxQuality,
        };
      },
      { imageInfoBase: IMAGE_INFO_BASE, format: IMAGE_FORMAT.PNG }
    );

    expect(result.minQuality).toBeLessThan(result.midQuality);
    expect(result.minQuality).toBeLessThan(result.defaultQuality);
    expect(result.minQuality).toBeLessThan(result.maxQuality);
    expect(result.midQuality).toBeLessThan(result.maxQuality);
    expect(result.defaultQuality).toEqual(result.maxQuality);
  });

  // this test can be failed on CanvasKit
  it('SkImage.encodeToBase64: WEBP checking of the "quality" argument work with default lossy - true', async () => {
    const result = await surface.eval(
      (Skia, ctx) => {
        const width = 1024;
        const height = 1024;
        const bytesPerPixel = 4;
        const bytes = new Uint8Array(width * height * bytesPerPixel);
        let i = 0;
        for (let x = 0; x < 256; x++) {
          for (let y = 0; y < 256; y++) {
            bytes[i++] = (x * y) % 255;
          }
        }
        const data = Skia.Data.fromBytes(bytes);
        const imageInfo = {
          ...ctx.imageInfoBase,
          width,
          height,
        };
        const image = Skia.Image.MakeImage(
          imageInfo,
          data,
          width * bytesPerPixel
        )!;
        const minQuality = image.encodeToBase64(ctx.format, 0, true).length;
        const midQuality = image.encodeToBase64(ctx.format, 50, true).length;
        const defaultQuality = image.encodeToBase64(
          ctx.format,
          undefined,
          true
        ).length; // default quality: 100.
        const maxQuality = image.encodeToBase64(ctx.format, 100, true).length;

        return {
          minQuality,
          midQuality,
          defaultQuality,
          maxQuality,
        };
      },
      { imageInfoBase: IMAGE_INFO_BASE, format: IMAGE_FORMAT.WEBP }
    );

    expect(result.minQuality).toBeLessThan(result.midQuality);
    expect(result.minQuality).toBeLessThan(result.defaultQuality);
    expect(result.minQuality).toBeLessThan(result.maxQuality);
    expect(result.midQuality).toBeLessThan(result.maxQuality);
    expect(result.defaultQuality).toEqual(result.maxQuality);
  });

  // this test can be failed on CanvasKit
  it('SkImage.encodeToBase64: WEBP checking of the "quality" argument work with lossless', async () => {
    const result = await surface.eval(
      (Skia, ctx) => {
        const width = 1024;
        const height = 1024;
        const bytesPerPixel = 4;
        const bytes = new Uint8Array(width * height * bytesPerPixel);
        let i = 0;
        for (let x = 0; x < 256; x++) {
          for (let y = 0; y < 256; y++) {
            bytes[i++] = (x * y) % 255;
          }
        }
        const data = Skia.Data.fromBytes(bytes);
        const imageInfo = {
          ...ctx.imageInfoBase,
          width,
          height,
        };
        const image = Skia.Image.MakeImage(
          imageInfo,
          data,
          width * bytesPerPixel
        )!;
        const minQuality = image.encodeToBase64(ctx.format, 0, false).length;
        const midQuality = image.encodeToBase64(ctx.format, 50, false).length;
        const defaultQuality = image.encodeToBase64(
          ctx.format,
          undefined,
          false
        ).length; // default quality: 100.
        const maxQuality = image.encodeToBase64(ctx.format, 100, false).length;

        return {
          minQuality,
          midQuality,
          defaultQuality,
          maxQuality,
        };
      },
      { imageInfoBase: IMAGE_INFO_BASE, format: IMAGE_FORMAT.WEBP }
    );

    expect(result.minQuality).not.toEqual(result.midQuality);
    expect(result.minQuality).not.toEqual(result.defaultQuality);
    expect(result.minQuality).not.toEqual(result.maxQuality);
    expect(result.midQuality).not.toEqual(result.maxQuality);
    expect(result.defaultQuality).toEqual(result.maxQuality);
  });

  // this test can be failed on CanvasKit
  it('SkImage.encodeToBase64: WEBP checking of the "lossy" argument work', async () => {
    const result = await surface.eval(
      (Skia, ctx) => {
        const width = 1024;
        const height = 1024;
        const bytesPerPixel = 4;
        const bytes = new Uint8Array(width * height * bytesPerPixel);
        let i = 0;
        for (let x = 0; x < 256; x++) {
          for (let y = 0; y < 256; y++) {
            bytes[i++] = (x * y) % 255;
          }
        }
        const data = Skia.Data.fromBytes(bytes);
        const imageInfo = {
          ...ctx.imageInfoBase,
          width,
          height,
        };
        const image = Skia.Image.MakeImage(
          imageInfo,
          data,
          width * bytesPerPixel
        )!;
        const defaultLossy = image.encodeToBase64(ctx.format).length; // default quality: 100.
        const lossy = image.encodeToBase64(ctx.format, undefined, true).length; // default quality: 100.
        const lossless = image.encodeToBase64(
          ctx.format,
          undefined,
          false
        ).length; // default quality: 100.

        return {
          defaultLossy,
          lossy,
          lossless,
        };
      },
      { imageInfoBase: IMAGE_INFO_BASE, format: IMAGE_FORMAT.WEBP }
    );

    expect(result.lossy).toEqual(result.defaultLossy);
    expect(result.lossy).not.toEqual(result.lossless);
    expect(result.defaultLossy).not.toEqual(result.lossless);
  });
});

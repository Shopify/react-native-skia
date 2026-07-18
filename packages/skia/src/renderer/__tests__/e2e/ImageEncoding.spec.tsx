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

type WebpMode = "legacy" | boolean;

const encodeVariants = (format: number, mode: WebpMode = "legacy") =>
  surface.eval(
    (Skia, ctx) => {
      const width = 64;
      const height = 64;
      const bytesPerPixel = 4;
      const bytes = new Uint8Array(width * height * bytesPerPixel);
      let offset = 0;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          bytes[offset++] = (x * 17 + y * 13) % 256;
          bytes[offset++] = (x * 7 + y * 29) % 256;
          bytes[offset++] = (x * 31 + y * 3) % 256;
          bytes[offset++] = 255;
        }
      }
      const data = Skia.Data.fromBytes(bytes);
      const image = Skia.Image.MakeImage(
        { ...ctx.imageInfoBase, width, height },
        data,
        width * bytesPerPixel
      )!;
      const encode = (quality?: number) =>
        ctx.mode === "legacy"
          ? image.encodeToBase64(ctx.format, quality)
          : image.encodeToBase64(ctx.format, quality, ctx.mode);

      return {
        below: encode(-1),
        negativeInfinity: encode(Number.NEGATIVE_INFINITY),
        zero: encode(0),
        middle: encode(50),
        standardPng: encode(100 / 3),
        hundred: encode(100),
        above: encode(101),
        positiveInfinity: encode(Number.POSITIVE_INFINITY),
        defaultQuality: encode(undefined),
        nan: encode(Number.NaN),
        losslessFalseAt50: image.encodeToBase64(ctx.format, 50, false),
        losslessTrueAt50: image.encodeToBase64(ctx.format, 50, true),
        undefinedFormatZero: image.encodeToBase64(undefined, 0),
      };
    },
    { imageInfoBase: IMAGE_INFO_BASE, format, mode }
  );

const readPngZlibHeader = (base64: string) => {
  const bytes = Buffer.from(base64, "base64");
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString("ascii", offset + 4, offset + 8);
    if (type === "IDAT") {
      const cmf = bytes[offset + 8];
      const flags = bytes[offset + 9];
      return {
        compressionMethod: cmf & 0x0f,
        validChecksum: ((cmf << 8) | flags) % 31 === 0,
        levelHint: flags >> 6,
      };
    }
    offset += 12 + length;
  }
  throw new Error("PNG has no IDAT chunk");
};

const readWebpPayloadFormat = (base64: string) => {
  const bytes = Buffer.from(base64, "base64");
  if (
    bytes.toString("ascii", 0, 4) !== "RIFF" ||
    bytes.toString("ascii", 8, 12) !== "WEBP"
  ) {
    throw new Error("Invalid WebP RIFF container");
  }
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const type = bytes.toString("ascii", offset, offset + 4);
    const length = bytes.readUInt32LE(offset + 4);
    if (type === "VP8 " || type === "VP8L") {
      return type;
    }
    offset += 8 + length + (length & 1);
  }
  throw new Error("WebP has no VP8 or VP8L payload");
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

  it("forwards quality and lossless through encodeToBytes", async () => {
    const result = await surface.eval(
      (Skia, ctx) => {
        const width = 8;
        const height = 8;
        const bytes = new Uint8Array(width * height * 4);
        for (let i = 0; i < bytes.length; i++) {
          bytes[i] = (i * 37) % 256;
        }
        const image = Skia.Image.MakeImage(
          { ...ctx.imageInfoBase, width, height },
          Skia.Data.fromBytes(bytes),
          width * 4
        )!;
        const png = image.encodeToBytes(undefined, 0);
        const webp = image.encodeToBytes(ctx.webp, undefined, true);

        let pngOffset = 8;
        let pngLevelHint = -1;
        while (pngOffset + 12 <= png.length) {
          const size =
            ((png[pngOffset] << 24) |
              (png[pngOffset + 1] << 16) |
              (png[pngOffset + 2] << 8) |
              png[pngOffset + 3]) >>>
            0;
          const type = String.fromCharCode(
            ...png.subarray(pngOffset + 4, pngOffset + 8)
          );
          if (type === "IDAT") {
            pngLevelHint = png[pngOffset + 9] >> 6;
            break;
          }
          pngOffset += 12 + size;
        }

        let webpOffset = 12;
        let webpPayload = "";
        while (webpOffset + 8 <= webp.length) {
          const type = String.fromCharCode(
            ...webp.subarray(webpOffset, webpOffset + 4)
          );
          const size =
            webp[webpOffset + 4] |
            (webp[webpOffset + 5] << 8) |
            (webp[webpOffset + 6] << 16) |
            (webp[webpOffset + 7] << 24);
          if (type === "VP8 " || type === "VP8L") {
            webpPayload = type;
            break;
          }
          webpOffset += 8 + size + (size & 1);
        }

        return { pngLevelHint, webpPayload };
      },
      { imageInfoBase: IMAGE_INFO_BASE, webp: IMAGE_FORMAT.WEBP }
    );

    expect(result).toEqual({ pngLevelHint: 3, webpPayload: "VP8L" });
  });

  it("normalizes JPEG quality and ignores lossless", async () => {
    const result = await encodeVariants(IMAGE_FORMAT.JPEG);

    expect(result.below).toEqual(result.zero);
    expect(result.negativeInfinity).toEqual(result.zero);
    expect(result.above).toEqual(result.hundred);
    expect(result.positiveInfinity).toEqual(result.hundred);
    expect(result.nan).toEqual(result.defaultQuality);
    expect(result.defaultQuality).toEqual(result.hundred);
    expect(result.zero).not.toEqual(result.middle);
    expect(result.middle).not.toEqual(result.hundred);
    expect(result.losslessFalseAt50).toEqual(result.losslessTrueAt50);
  });

  it("maps PNG quality to zlib levels and keeps level 6 by default", async () => {
    const result = await encodeVariants(IMAGE_FORMAT.PNG);

    expect(result.below).toEqual(result.zero);
    expect(result.negativeInfinity).toEqual(result.zero);
    expect(result.above).toEqual(result.hundred);
    expect(result.positiveInfinity).toEqual(result.hundred);
    expect(result.nan).toEqual(result.defaultQuality);
    expect(result.defaultQuality).toEqual(result.standardPng);
    expect(result.undefinedFormatZero).toEqual(result.zero);
    expect(result.losslessFalseAt50).toEqual(result.losslessTrueAt50);

    expect(readPngZlibHeader(result.zero)).toEqual({
      compressionMethod: 8,
      validChecksum: true,
      levelHint: 3,
    });
    expect(readPngZlibHeader(result.middle).levelHint).toBe(1);
    expect(readPngZlibHeader(result.defaultQuality).levelHint).toBe(2);
    expect(readPngZlibHeader(result.hundred).levelHint).toBe(0);
  });

  it("selects legacy, lossy and lossless WebP modes explicitly", async () => {
    // Keep remote device evaluations sequential: each response is delivered
    // over the same test websocket.
    const legacy = await encodeVariants(IMAGE_FORMAT.WEBP);
    const lossy = await encodeVariants(IMAGE_FORMAT.WEBP, false);
    const lossless = await encodeVariants(IMAGE_FORMAT.WEBP, true);

    expect(readWebpPayloadFormat(legacy.zero)).toBe("VP8 ");
    expect(readWebpPayloadFormat(legacy.middle)).toBe("VP8 ");
    expect(readWebpPayloadFormat(legacy.defaultQuality)).toBe("VP8L");
    expect(readWebpPayloadFormat(legacy.hundred)).toBe("VP8L");

    expect(readWebpPayloadFormat(lossy.zero)).toBe("VP8 ");
    expect(readWebpPayloadFormat(lossy.middle)).toBe("VP8 ");
    expect(readWebpPayloadFormat(lossy.hundred)).toBe("VP8 ");
    expect(readWebpPayloadFormat(lossy.defaultQuality)).toBe("VP8 ");

    expect(readWebpPayloadFormat(lossless.zero)).toBe("VP8L");
    expect(readWebpPayloadFormat(lossless.middle)).toBe("VP8L");
    expect(readWebpPayloadFormat(lossless.hundred)).toBe("VP8L");
    expect(readWebpPayloadFormat(lossless.defaultQuality)).toBe("VP8L");

    for (const result of [legacy, lossy, lossless]) {
      expect(result.below).toEqual(result.zero);
      expect(result.negativeInfinity).toEqual(result.zero);
      expect(result.above).toEqual(result.hundred);
      expect(result.positiveInfinity).toEqual(result.hundred);
      expect(result.nan).toEqual(result.defaultQuality);
      expect(result.defaultQuality).toEqual(result.hundred);
    }

    expect(lossy.zero).not.toEqual(lossy.hundred);
    expect(lossless.zero).not.toEqual(lossless.hundred);
    expect(lossy.hundred).not.toEqual(legacy.hundred);
  });
});

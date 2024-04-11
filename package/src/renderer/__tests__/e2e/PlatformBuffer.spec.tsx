import { checkImage } from "../../../__tests__/setup";
import { AlphaType, ColorType } from "../../../skia/types";
import { setupSkia } from "../../../skia/__tests__/setup";
import { surface } from "../setup";

const shouldPlatformBufferTestRun = () => {
  // Skip outside iOS and Android
  if (surface.OS !== "ios" && surface.OS !== "android") {
    return false;
  }
  // Skip test on Fabric (it runs on API Level 21 which doesn't support platform buffers)
  if (surface.arch === "fabric" && surface.OS === "android") {
    return false;
  }
  return true;
};

const rgbaPixels = new Array(256 * 256 * 4).fill(0);
rgbaPixels.fill(255);
let i = 0;
for (let x = 0; x < 256 * 4; x++) {
  for (let y = 0; y < 256 * 4; y++) {
    rgbaPixels[i++] = (x * y) % 255;
  }
}

const bgraPixels = new Array(256 * 256 * 4).fill(0);
bgraPixels.fill(255);
// Conversion from RGBA to BGRA
for (let j = 0; j < rgbaPixels.length; j += 4) {
  const r = rgbaPixels[j];
  const g = rgbaPixels[j + 1];
  const b = rgbaPixels[j + 2];
  const a = rgbaPixels[j + 3];

  // In BGRA, the blue and red channels are swapped
  bgraPixels[j] = b; // Blue
  bgraPixels[j + 1] = g; // Green remains the same
  bgraPixels[j + 2] = r; // Red
  bgraPixels[j + 3] = a; // Alpha remains the same
}

describe("Platform Buffers", () => {
  it("On non supported platforms MakeImageFromPlatformBuffer() should throw", async () => {
    const { Skia: Sk } = setupSkia();
    if (!shouldPlatformBufferTestRun()) {
      return;
    }
    const result = await surface.eval((Skia) => {
      const sur = Skia.Surface.Make(256, 256)!;
      const canvas = sur.getCanvas();
      canvas.drawColor(Skia.Color("cyan"));
      const platformBuffer = Skia.PlatformBuffer.MakeFromImage(
        sur.makeImageSnapshot()
      );
      return platformBuffer.toString();
    });
    const pointer = BigInt(result);
    expect(pointer).not.toBe(BigInt(0));
    const t = () => {
      Sk.Image.MakeImageFromPlatformBuffer(pointer);
    };
    expect(t).toThrow(Error);
    // Now we need to release the platform buffer
    const success = await surface.eval(
      (Skia, ctx) => {
        Skia.PlatformBuffer.Release(BigInt(ctx.pointer));
        return true;
      },
      { pointer: pointer.toString() }
    );
    expect(success).toBe(true);
  });
  it("creates a platform buffer from an image", async () => {
    if (!shouldPlatformBufferTestRun()) {
      return;
    }
    const result = await surface.eval((Skia) => {
      const sur = Skia.Surface.Make(256, 256)!;
      const canvas = sur.getCanvas();
      const paint = Skia.Paint();
      paint.setColor(Skia.Color("cyan"));
      canvas.drawCircle(128, 128, 128, paint);
      const platformBuffer = Skia.PlatformBuffer.MakeFromImage(
        sur.makeImageSnapshot()
      );
      const r = platformBuffer.toString();
      Skia.PlatformBuffer.Release(platformBuffer);
      return r;
    });
    expect(BigInt(result)).not.toBe(BigInt(0));
  });
  it("creates an image from a platform buffer", async () => {
    const { Skia: Sk } = setupSkia();
    // Skip outside iOS and Android
    if (!shouldPlatformBufferTestRun()) {
      return;
    }
    const result = await surface.eval((Skia) => {
      const sur = Skia.Surface.Make(256, 256)!;
      const canvas = sur.getCanvas();
      canvas.drawColor(Skia.Color("cyan"));
      const platformBuffer = Skia.PlatformBuffer.MakeFromImage(
        sur.makeImageSnapshot()
      );
      const image = Skia.Image.MakeImageFromPlatformBuffer(platformBuffer);
      Skia.PlatformBuffer.Release(platformBuffer);
      return Array.from(image.encodeToBytes());
    });
    const image = Sk.Image.MakeImageFromEncoded(
      Sk.Data.fromBytes(new Uint8Array(result))
    )!;
    expect(image).not.toBeNull();
    checkImage(image, "snapshots/cyan-buffer.png");
  });
  it("creates an image from native color type", async () => {
    const { Skia: Sk } = setupSkia();
    // Skip outside iOS and Android
    if (!shouldPlatformBufferTestRun()) {
      return;
    }
    const result = await surface.eval(
      (Skia, { alphaType, colorType, ...ctx }) => {
        const pixels = new Uint8Array(ctx.originalPixels);
        const data = Skia.Data.fromBytes(pixels);
        const img = Skia.Image.MakeImage(
          {
            width: 256,
            height: 256,
            alphaType,
            colorType,
          },
          data,
          256 * 4
        )!;

        const platformBuffer = Skia.PlatformBuffer.MakeFromImage(img);
        const image = Skia.Image.MakeImageFromPlatformBuffer(platformBuffer);
        Skia.PlatformBuffer.Release(platformBuffer);
        return Array.from(image.encodeToBytes());
      },
      {
        alphaType: AlphaType.Opaque,
        colorType:
          surface.OS === "android" ? ColorType.RGBA_8888 : ColorType.BGRA_8888,
        originalPixels: surface.OS === "android" ? rgbaPixels : bgraPixels,
      }
    );
    const image = Sk.Image.MakeImageFromEncoded(
      Sk.Data.fromBytes(new Uint8Array(result))
    )!;
    expect(image).not.toBeNull();
    checkImage(image, "snapshots/platform-buffer.png", { overwrite: true });
  });
});

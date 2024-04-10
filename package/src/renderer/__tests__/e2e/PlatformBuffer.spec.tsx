import { checkImage } from "../../../__tests__/setup";
import { setupSkia } from "../../../skia/__tests__/setup";
import { surface } from "../setup";

describe("Platform Buffers", () => {
  it("creates a platform buffer from an image", async () => {
    const result = await surface.eval((Skia) => {
      const sur = Skia.Surface.Make(256, 256)!;
      const canvas = sur.getCanvas();
      const paint = Skia.Paint();
      paint.setColor(Skia.Color("cyan"));
      canvas.drawCircle(128, 128, 128, paint);
      const platformBuffer = Skia.Image.MakePlatformBuffer(
        sur.makeImageSnapshot()
      );
      const r = platformBuffer.pointer.toString();
      platformBuffer.delete();
      return r;
    });
    // Skip test on Fabric (it runs on API Level 21 which doesn't support platform buffers)
    if (surface.arch === "fabric" && surface.OS === "android") {
      expect(BigInt(result)).toBe(0);
    } else {
      expect(BigInt(result)).not.toBe(BigInt(0));
    }
  });
  it("creates an image from a platform buffer", async () => {
    const { Skia: Sk } = setupSkia();
    // Skip test on Fabric (it runs on API Level 21 which doesn't support platform buffers)
    if (surface.arch === "fabric" && surface.OS === "android") {
      return;
    }
    const result = await surface.eval((Skia) => {
      const pixels = new Uint8Array(256 * 256 * 4);
      pixels.fill(255);
      let i = 0;
      for (let x = 0; x < 256 * 4; x++) {
        for (let y = 0; y < 256 * 4; y++) {
          pixels[i++] = (x * y) % 255;
        }
      }
      const data = Skia.Data.fromBytes(pixels);
      const img = Skia.Image.MakeImage(
        {
          width: 256,
          height: 256,
          alphaType: 1, //opaque
          colorType: 4, // RGBA_8888
        },
        data,
        256 * 4
      )!;
      const platformBuffer = Skia.Image.MakePlatformBuffer(img);
      const image = Skia.Image.MakeImageFromPlatformBuffer(
        platformBuffer.pointer
      ).encodeToBytes();
      platformBuffer.delete();
      return Array.from(image);
    });
    const image = Sk.Image.MakeImageFromEncoded(
      Sk.Data.fromBytes(new Uint8Array(result))
    )!;
    expect(image).not.toBeNull();
    checkImage(image, "snapshots/platform-buffer.png");
  });
});

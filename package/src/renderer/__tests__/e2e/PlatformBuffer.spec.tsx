import { checkImage } from "../../../__tests__/setup";
import { setupSkia } from "../../../skia/__tests__/setup";
import { surface } from "../setup";

describe("Platform Buffers", () => {
  it("creates a platform buffer from an image", async () => {
    // Skip outside iOS and Android
    if (surface.OS !== "ios" && surface.OS !== "android") {
      return;
    }
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
    // Skip outside iOS and Android
    if (surface.OS !== "ios" && surface.OS !== "android") {
      return;
    }
    // Skip test on Fabric (it runs on API Level 21 which doesn't support platform buffers)
    if (surface.arch === "fabric" && surface.OS === "android") {
      return;
    }
    const result = await surface.eval((Skia) => {
      const sur = Skia.Surface.Make(256, 256)!;
      const canvas = sur.getCanvas();
      canvas.drawColor(Skia.Color("cyan"));
      const platformBuffer = Skia.Image.MakePlatformBuffer(
        sur.makeImageSnapshot()
      );
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
    checkImage(image, "snapshots/cyan-buffer.png");
  });
});

import { checkImage } from "../../../__tests__/setup";
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
      const platformBuffer = Skia.Image.MakePlatformBuffer(
        sur.makeImageSnapshot()
      );
      return platformBuffer.pointer.toString();
    });
    const pointer = BigInt(result);
    expect(pointer).not.toBe(BigInt(0));
    const t = () => {
      Sk.Image.MakeImageFromPlatformBuffer(pointer);
    };
    expect(t).toThrow(Error);
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
      const platformBuffer = Skia.Image.MakePlatformBuffer(
        sur.makeImageSnapshot()
      );
      const r = platformBuffer.pointer.toString();
      platformBuffer.delete();
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
      const platformBuffer = Skia.Image.MakePlatformBuffer(
        sur.makeImageSnapshot()
      );
      const image = Skia.Image.MakeImageFromPlatformBuffer(
        platformBuffer.pointer
      );

      platformBuffer.delete();
      return Array.from(image.encodeToBytes());
    });
    const image = Sk.Image.MakeImageFromEncoded(
      Sk.Data.fromBytes(new Uint8Array(result))
    )!;
    expect(image).not.toBeNull();
    checkImage(image, "snapshots/cyan-buffer.png");
  });
});

import { surface } from "../setup";

describe("Platform Buffers", () => {
  it("creates a platforms from an image", async () => {
    const result = await surface.eval((Skia) => {
      const sur = Skia.Surface.Make(256, 256)!;
      const canvas = sur.getCanvas();
      const paint = Skia.Paint();
      paint.setColor(Skia.Color("cyan"));
      canvas.drawCircle(128, 128, 128, paint);
      const platformBuffer = Skia.Image.MakePlatformBuffer(
        sur.makeImageSnapshot()
      );
      return platformBuffer.pointer === BigInt(0);
    });
    expect(result).not.toBe(true);
  });
});

import { docPath, checkImage } from "../../../__tests__/setup";
import { surface, importSkia, images } from "../setup";

const checkResult = (base64: string, path: string) => {
  const { Skia } = importSkia();
  const rData = Skia.Data.fromBase64(base64);
  const image = Skia.Image.MakeImageFromEncoded(rData)!;
  expect(rData).toBeDefined();
  checkImage(image, docPath(path));
};

describe("Advanced Image Filters", () => {
  it("Arithmetic", async () => {
    const { skiaLogoPng } = images;
    const base64 = await surface.eval(
      (Skia, ctx) => {
        const sur = Skia.Surface.Make(768, 768)!;
        const canvas = sur.getCanvas();
        const paint = Skia.Paint();
        // Create a blurred version of the image for the glow effect
        const CLAMP = 0;
        const blurFilter = Skia.ImageFilter.MakeBlur(5.0, 5.0, CLAMP);

        // Original image
        const originalImage = null; // This uses the source bitmap

        // Neon Glow effect
        const neonGlowFilter = Skia.ImageFilter.MakeArithmetic(
          0.0, // k1: No multiplication between foreground and background
          1.5, // k2: Amplify the blurred foreground (the glow)
          1.0, // k3: Keep the original background fully
          0.0, // k4: No constant addition
          true, // enforcePMColor: Clamp RGB channels to alpha
          originalImage, // background: Original sharp image
          blurFilter, // foreground: Blurred version creates the glow
          null // cropRect: No cropping
        );
        paint.setImageFilter(neonGlowFilter);
        canvas.drawImage(ctx.skiaLogoPng, 0, 0, paint);
        sur.flush();
        return sur.makeImageSnapshot().encodeToBase64();
      },
      { skiaLogoPng }
    );
    checkResult(base64, "advanced-image-filters/arthimetic.png");
  });
});

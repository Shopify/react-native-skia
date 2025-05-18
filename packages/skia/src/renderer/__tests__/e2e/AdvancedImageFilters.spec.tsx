import { docPath, checkImage } from "../../../__tests__/setup";
import { PaintStyle, TileMode } from "../../../skia/types";
import { surface, importSkia, images } from "../setup";

const checkResult = (base64: string, path: string) => {
  const { Skia } = importSkia();
  const rData = Skia.Data.fromBase64(base64);
  const image = Skia.Image.MakeImageFromEncoded(rData)!;
  expect(rData).toBeDefined();
  checkImage(image, docPath(path));
};

describe("Advanced Image Filters", () => {
  it("Arithmetic - Neon Glow", async () => {
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
    checkResult(base64, "advanced-image-filters/arithmetic-neon-glow.png");
  });

  it("Crop - Viewport Portal", async () => {
    const { skiaLogoPng } = images;
    const base64 = await surface.eval(
      (Skia, ctx) => {
        const sur = Skia.Surface.Make(768, 768)!;
        const canvas = sur.getCanvas();

        // Draw background image first
        canvas.drawImage(ctx.skiaLogoPng, 0, 0);

        // Create a paint for our portal effect
        const paint = Skia.Paint();

        // Create an input filter that applies a colorization and rotation to the secondary image
        const colorMatrix = [
          0.8,
          0.2,
          0,
          0,
          0, // Add some red tint
          0.2,
          0.8,
          0,
          0,
          0, // Add some green tint
          0,
          0.2,
          1.0,
          0,
          0, // Add some blue boost
          0,
          0,
          0,
          1,
          0, // Alpha unchanged
        ];

        // Create color matrix filter
        const colorFilter = Skia.ColorFilter.MakeMatrix(colorMatrix);

        // Create the image filter from the secondary image
        const secondaryImageFilter = Skia.ImageFilter.MakeColorFilter(
          colorFilter,
          Skia.ImageFilter.MakeImage(ctx.skiaLogoPng)
        );

        // Define a circular viewport in the center
        const centerX = 384;
        const centerY = 384;
        const radius = 150;

        // Create a circular crop rect (positioned to center of canvas)
        const cropRect = Skia.XYWHRect(
          centerX - radius,
          centerY - radius,
          radius * 2,
          radius * 2
        );

        // Use MIRROR tiling mode for an interesting effect at the edges
        const MIRROR = ctx.TileMode.Mirror;

        // Create the crop filter with mirror tiling
        const portalFilter = Skia.ImageFilter.MakeCrop(
          cropRect,
          MIRROR,
          secondaryImageFilter
        );

        // Set the filter to our paint
        paint.setImageFilter(portalFilter);

        // Draw a circle that will contain our portal effect
        canvas.drawCircle(centerX, centerY, radius, paint);

        // Optional: Add a stroke around the portal for definition
        const strokePaint = Skia.Paint();
        strokePaint.setStyle(ctx.PaintStyle.Stroke);
        strokePaint.setStrokeWidth(8);
        strokePaint.setColor(Skia.Color("white"));
        canvas.drawCircle(centerX, centerY, radius, strokePaint);

        sur.flush();
        return sur.makeImageSnapshot().encodeToBase64();
      },
      { skiaLogoPng, PaintStyle, TileMode }
    );
    checkResult(base64, "advanced-image-filters/crop-viewport-portal.png");
  });
});

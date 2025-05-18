import { docPath, checkImage } from "../../../__tests__/setup";
import {
  BlendMode,
  FilterMode,
  MipmapMode,
  PaintStyle,
  TileMode,
} from "../../../skia/types";
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

  it("Empty - Silhouette Effect", async () => {
    const { skiaLogoPng } = images;
    const base64 = await surface.eval(
      (Skia, ctx) => {
        const sur = Skia.Surface.Make(768, 768)!;
        const canvas = sur.getCanvas();

        // Fill background with a gradient
        const bgPaint = Skia.Paint();
        const shader = Skia.Shader.MakeLinearGradient(
          { x: 0, y: 0 },
          { x: 768, y: 768 },
          [
            Skia.Color("rgba(20, 20, 100, 1)"),
            Skia.Color("rgba(100, 40, 150, 1)"),
          ],
          null,
          ctx.TileMode.Clamp
        );
        bgPaint.setShader(shader);
        canvas.drawRect(Skia.XYWHRect(0, 0, 768, 768), bgPaint);

        // Create our silhouette effect
        const paint = Skia.Paint();

        // First, we'll create a mask using the original image and a blur
        const imageMask = Skia.ImageFilter.MakeImage(ctx.skiaLogoPng);
        const blurredMask = Skia.ImageFilter.MakeBlur(
          3,
          3,
          ctx.TileMode.Decal,
          imageMask
        );

        // Create an empty filter (transparent black)
        const emptyFilter = Skia.ImageFilter.MakeEmpty();

        // Combine the mask with empty filter using MakeBlend
        // This creates a silhouette where the image is
        const BLEND_MODE = ctx.BlendMode.Src;
        const silhouetteFilter = Skia.ImageFilter.MakeBlend(
          BLEND_MODE,
          emptyFilter, // Using the empty filter for the black silhouette
          blurredMask // Using the blurred image as the mask
        );

        // Set our filter to the paint
        paint.setImageFilter(silhouetteFilter);
        paint.setColor(Skia.Color("rgba(0,0,0,0.8)")); // Semi-transparent black

        // Draw a rectangle covering the entire canvas with our filter
        canvas.drawRect(Skia.XYWHRect(0, 0, 768, 768), paint);

        // Add some decorative highlights at the edges
        const highlightPaint = Skia.Paint();
        highlightPaint.setColor(Skia.Color("rgba(255, 255, 255, 0.4)"));
        highlightPaint.setImageFilter(blurredMask);
        canvas.drawRect(Skia.XYWHRect(5, 5, 758, 758), highlightPaint);

        sur.flush();
        return sur.makeImageSnapshot().encodeToBase64();
      },
      { skiaLogoPng, BlendMode, TileMode }
    );
    checkResult(base64, "advanced-image-filters/empty-silhouette.png");
  });

  it("MakeImage - Dynamic Mosaic", async () => {
    const { skiaLogoPng, mask } = images;
    const base64 = await surface.eval(
      (Skia, ctx) => {
        const sur = Skia.Surface.Make(768, 768)!;
        const canvas = sur.getCanvas();

        // Draw a background
        const bgPaint = Skia.Paint();
        bgPaint.setColor(Skia.Color("gray"));
        canvas.drawRect(Skia.XYWHRect(0, 0, 768, 768), bgPaint);

        // Create a mosaic effect using MakeImage filter
        const mosaicPaint = Skia.Paint();

        // We'll create a 4x4 grid of tiles
        const numTiles = 4;
        const tileSize = 768 / numTiles;

        // We'll alternate between the two images
        const allImages = [ctx.skiaLogoPng, ctx.mask];

        // Draw each tile with a different srcRect using MakeImage
        for (let y = 0; y < numTiles; y++) {
          for (let x = 0; x < numTiles; x++) {
            // Alternate images based on checkerboard pattern
            const imageIndex = (x + y) % 2;
            const currentImage = allImages[imageIndex];

            // Calculate source rectangle (use different areas of the source image)
            // We'll create a dynamic effect by using different parts of the image
            const srcX = (x * currentImage.width()) / numTiles;
            const srcY = (y * currentImage.height()) / numTiles;
            const srcWidth = currentImage.width() / numTiles;
            const srcHeight = currentImage.height() / numTiles;

            const srcRect = Skia.XYWHRect(srcX, srcY, srcWidth, srcHeight);

            // Calculate destination rectangle with some margin for visual separation
            const margin = 8;
            const dstX = x * tileSize + margin / 2;
            const dstY = y * tileSize + margin / 2;
            const dstWidth = tileSize - margin;
            const dstHeight = tileSize - margin;

            const dstRect = Skia.XYWHRect(dstX, dstY, dstWidth, dstHeight);

            // Create the image filter with Linear filtering for smoother scaling
            const imageFilter = Skia.ImageFilter.MakeImage(
              currentImage,
              srcRect,
              dstRect,
              ctx.FilterMode.Linear,
              ctx.MipmapMode.Linear
            );

            // Set the filter and draw the tile
            mosaicPaint.setImageFilter(imageFilter);
            canvas.drawRect(dstRect, mosaicPaint);

            // Add a subtle border around each tile
            const borderPaint = Skia.Paint();
            borderPaint.setStyle(ctx.PaintStyle.Stroke);
            borderPaint.setStrokeWidth(2);
            borderPaint.setColor(Skia.Color("gray"));
            canvas.drawRect(dstRect, borderPaint);
          }
        }

        sur.flush();
        return sur.makeImageSnapshot().encodeToBase64();
      },
      { skiaLogoPng, FilterMode, MipmapMode, PaintStyle, TileMode, mask }
    );
    checkResult(base64, "advanced-image-filters/makeimage-mosaic.png");
  });
});

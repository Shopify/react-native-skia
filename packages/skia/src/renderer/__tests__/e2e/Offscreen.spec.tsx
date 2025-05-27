import React from "react";

import { checkImage, docPath } from "../../../__tests__/setup";
import { Circle } from "../../components";
import { surface, importSkia } from "../setup";
import { ColorType } from "../../../skia/types";

describe("Offscreen Drawings", () => {
  it("Should use the canvas API to build an image", async () => {
    const { width, height } = surface;
    const raw = await surface.eval(
      (Skia, ctx) => {
        const r = ctx.width / 2;
        const offscreen = Skia.Surface.MakeOffscreen(ctx.width, ctx.height)!;
        if (!offscreen) {
          throw new Error("Could not create offscreen surface");
        }
        const canvas = offscreen.getCanvas();
        const paint = Skia.Paint();
        paint.setColor(Skia.Color("lightblue"));
        canvas.drawCircle(r, r, r, paint);
        offscreen.flush();
        return offscreen.makeImageSnapshot().encodeToBase64();
      },
      { width, height }
    );
    const { Skia } = importSkia();
    const data = Skia.Data.fromBase64(raw);
    const image = Skia.Image.MakeImageFromEncoded(data)!;
    expect(data).toBeDefined();
    checkImage(image, docPath("offscreen/circle.png"));
  });
  it("Should transfer one surface image to another", async () => {
    const { width, height } = surface;
    const raw = await surface.eval(
      (Skia, ctx) => {
        const r = ctx.width / 2;
        const backSurface = Skia.Surface.MakeOffscreen(ctx.width, ctx.height)!;
        const frontSurface = Skia.Surface.MakeOffscreen(ctx.width, ctx.height)!;
        if (!backSurface || !frontSurface) {
          throw new Error("Could not create offscreen surface");
        }
        const canvas = backSurface.getCanvas();
        const paint = Skia.Paint();
        paint.setColor(Skia.Color("lightblue"));
        canvas.drawCircle(r, r, r, paint);
        backSurface.flush();
        const image = backSurface.makeImageSnapshot();
        frontSurface.getCanvas().drawImage(image, 0, 0);
        return frontSurface.makeImageSnapshot().encodeToBase64();
      },
      { width, height }
    );
    const { Skia } = importSkia();
    const data = Skia.Data.fromBase64(raw);
    const image = Skia.Image.MakeImageFromEncoded(data)!;
    expect(data).toBeDefined();
    checkImage(image, docPath("offscreen/circle.png"));
  });

  it("Should render to multiple offscreen surfaces at once (1)", async () => {
    const { width, height } = surface;
    const raw = await surface.eval(
      (Skia, ctx) => {
        const r = ctx.width / 4;
        const backSurface1 = Skia.Surface.MakeOffscreen(ctx.width, ctx.height)!;
        const backSurface2 = Skia.Surface.MakeOffscreen(ctx.width, ctx.height)!;
        const frontSurface = Skia.Surface.MakeOffscreen(ctx.width, ctx.height)!;
        if (!backSurface1 || !backSurface2 || !frontSurface) {
          throw new Error("Could not create offscreen surface");
        }
        // Paint to first surface
        const canvas1 = backSurface1.getCanvas();
        const paint1 = Skia.Paint();
        paint1.setColor(Skia.Color("lightblue"));
        canvas1.drawCircle(r, r, r, paint1);
        backSurface1.flush();

        // Paint to second surface
        const canvas2 = backSurface2.getCanvas();
        const paint2 = Skia.Paint();
        paint2.setColor(Skia.Color("magenta"));
        canvas2.drawCircle(r, r, r / 2, paint2);
        backSurface2.flush();

        const image1 = backSurface1.makeImageSnapshot();
        const image2 = backSurface2.makeImageSnapshot();
        frontSurface.getCanvas().drawImage(image1, 0, 0);
        frontSurface.getCanvas().drawImage(image2, ctx.width / 2, 0);
        return frontSurface.makeImageSnapshot().encodeToBase64();
      },
      { width, height }
    );
    const { Skia } = importSkia();
    const data = Skia.Data.fromBase64(raw);
    const image = Skia.Image.MakeImageFromEncoded(data)!;
    expect(data).toBeDefined();
    checkImage(image, docPath("offscreen/multiple_circles.png"));
  });
  it("Should use the React API to build an image", async () => {
    const { width, height } = surface;
    const { drawAsImage } = importSkia();
    const r = width / 2;
    const image = await drawAsImage(
      <Circle r={r} cx={r} cy={r} color="lightblue" />,
      { width, height }
    );
    checkImage(image, docPath("offscreen/circle.png"));
  });

  it("Should support 16-bit texture formats", async () => {
    const result = await surface.eval(
      (Skia, ctx) => {
        // Create a small 2x2 surface with 16-bit float format
        const offscreen16bit = Skia.Surface.MakeOffscreen(2, 2, ctx.colorType);
        if (!offscreen16bit) {
          throw new Error("Could not create 16-bit offscreen surface");
        }

        const canvas = offscreen16bit.getCanvas();
        const paint = Skia.Paint();

        // Draw with a high dynamic range color value (> 1.0)
        // This tests if 16-bit float format can handle values beyond [0,1] range
        paint.setColor(Float32Array.of(2.0, 0.5, 0.25, 1.0));
        canvas.drawRect(Skia.XYWHRect(0, 0, 1, 1), paint);

        paint.setColor(Float32Array.of(0.125, 1.5, 0.75, 1.0));
        canvas.drawRect(Skia.XYWHRect(1, 0, 1, 1), paint);

        paint.setColor(Float32Array.of(0.75, 0.25, 3.0, 1.0));
        canvas.drawRect(Skia.XYWHRect(0, 1, 1, 1), paint);

        paint.setColor(Float32Array.of(1.25, 2.5, 0.5, 1.0));
        canvas.drawRect(Skia.XYWHRect(1, 1, 1, 1), paint);

        offscreen16bit.flush();

        // Read pixels to verify we can handle 16-bit data
        const image = offscreen16bit.makeImageSnapshot();
        const pixelData = image.readPixels();

        // Verify we got some pixel data back
        if (!pixelData) {
          throw new Error("Failed to read pixels from 16-bit surface");
        }

        // For 16-bit surfaces, we expect different behavior than 8-bit
        // The pixel data should be a Float32Array for 16-bit formats
        const isFloat32Array = pixelData instanceof Float32Array;
        const isUint8Array = pixelData instanceof Uint8Array;
        const expectedLength = 2 * 2 * 4; // 2x2 pixels, 4 channels (RGBA)

        return {
          success: true,
          pixelDataLength: pixelData.length,
          expectedLength,
          isFloat32Array,
          isUint8Array,
          arrayConstructorName: pixelData.constructor.name,
          // For verification, return first few pixel values
          firstPixels: Array.from(pixelData.slice(0, 16)),
          actualColorType: image.getImageInfo().colorType,
          expectedColorType: ctx.colorType,
          surfaceWidth: image.width(),
          surfaceHeight: image.height(),
        };
      },
      { colorType: ColorType.RGBA_F16 }
    );

    // Verify the test completed successfully
    expect(result.success).toBe(true);
    expect(result.surfaceWidth).toBe(2);
    expect(result.surfaceHeight).toBe(2);
    expect(result.pixelDataLength).toBeGreaterThan(0);
    expect(result.actualColorType).toBe(ColorType.RGBA_F16);
    expect(result.actualColorType).toBe(result.expectedColorType);

    // Verify that 16-bit formats return Float32Array instead of Uint8Array
    expect(result.isFloat32Array).toBe(true);
    expect(result.isUint8Array).toBe(false);
    expect(result.arrayConstructorName).toBe("Float32Array");
  });

  it("Should use platform-specific default color types", async () => {
    const result = await surface.eval(
      (Skia, ctx) => {
        // Create surface without specifying color type (uses platform default)
        const defaultSurface = Skia.Surface.MakeOffscreen(2, 2);
        if (!defaultSurface) {
          throw new Error("Could not create default offscreen surface");
        }

        const canvas = defaultSurface.getCanvas();
        const paint = Skia.Paint();
        paint.setColor(Skia.Color("red"));
        canvas.drawRect(Skia.XYWHRect(0, 0, 2, 2), paint);
        defaultSurface.flush();

        // Create surface with explicit RGBA_8888 (ColorType enum value 4)
        const rgba8888Surface = Skia.Surface.MakeOffscreen(
          2,
          2,
          ctx.rgba8888ColorType
        );
        if (!rgba8888Surface) {
          throw new Error("Could not create RGBA_8888 offscreen surface");
        }

        const canvas2 = rgba8888Surface.getCanvas();
        const paint2 = Skia.Paint();
        paint2.setColor(Skia.Color("red"));
        canvas2.drawRect(Skia.XYWHRect(0, 0, 2, 2), paint2);
        rgba8888Surface.flush();

        // Both should work and produce similar results
        const defaultImage = defaultSurface.makeImageSnapshot();
        const rgba8888Image = rgba8888Surface.makeImageSnapshot();

        // Test pixel data types for 8-bit vs 16-bit formats
        const rgba8888PixelData = rgba8888Image.readPixels();
        const isRgba8888Uint8Array = rgba8888PixelData instanceof Uint8Array;
        const isRgba8888Float32Array =
          rgba8888PixelData instanceof Float32Array;

        return {
          success: true,
          defaultImageWidth: defaultImage.width(),
          defaultImageHeight: defaultImage.height(),
          rgba8888ImageWidth: rgba8888Image.width(),
          rgba8888ImageHeight: rgba8888Image.height(),
          defaultImageColorType: defaultImage.getImageInfo().colorType,
          rgba8888ImageColorType: rgba8888Image.getImageInfo().colorType,
          // Verify 8-bit format returns Uint8Array
          isRgba8888Uint8Array,
          isRgba8888Float32Array,
          rgba8888ArrayConstructorName: rgba8888PixelData
            ? rgba8888PixelData.constructor.name
            : null,
        };
      },
      { rgba8888ColorType: ColorType.RGBA_8888 }
    );

    expect(result.success).toBe(true);
    expect(result.defaultImageWidth).toBe(2);
    expect(result.defaultImageHeight).toBe(2);
    expect(result.rgba8888ImageWidth).toBe(2);
    expect(result.rgba8888ImageHeight).toBe(2);

    // Verify that the explicit RGBA_8888 surface has the correct color type
    expect(result.defaultImageColorType).toBe(
      surface.OS === "ios" ? ColorType.BGRA_8888 : ColorType.RGBA_8888
    );

    // Verify that the default surface has a valid color type (platform-specific)
    expect(result.defaultImageColorType).toBeDefined();
    expect(typeof result.defaultImageColorType).toBe("number");

    // Verify that 8-bit formats return Uint8Array (not Float32Array)
    expect(result.isRgba8888Uint8Array).toBe(true);
    expect(result.isRgba8888Float32Array).toBe(false);
    expect(result.rgba8888ArrayConstructorName).toBe("Uint8Array");
  });
});

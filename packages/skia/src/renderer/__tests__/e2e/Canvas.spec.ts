import { BlendMode, PointMode } from "../../../skia/types";
import { surface } from "../setup";

describe("SkCanvas", () => {
  it("drawPatch works with omitted and nullable optional arguments", async () => {
    const result = await surface.eval((Skia) => {
      const surf = Skia.Surface.Make(16, 16)!;
      const canvas = surf.getCanvas();
      const cubics = Array.from({ length: 12 }, (_, i) => ({ x: i, y: i }));
      const colors = [
        Skia.Color("red"),
        Skia.Color("green"),
        Skia.Color("blue"),
        Skia.Color("white"),
      ];
      const paint = Skia.Paint();

      // 1 argument (only cubics)
      canvas.drawPatch(cubics);

      // 2 arguments (cubics and colors)
      canvas.drawPatch(cubics, colors);

      // 3 arguments (cubics, colors, texs)
      canvas.drawPatch(cubics, colors, null);

      // 4 arguments (cubics, colors, texs, mode)
      canvas.drawPatch(cubics, colors, null, BlendMode.SrcOver);

      // 5 arguments (cubics, colors, texs, mode, paint)
      canvas.drawPatch(cubics, colors, null, BlendMode.SrcOver, paint);

      // Nullable arguments
      canvas.drawPatch(cubics, null, null, null, null);

      surf.flush();
      return true;
    });
    expect(result).toBe(true);
  });

  it("drawAtlas works when colors are omitted", async () => {
    const result = await surface.eval((Skia) => {
      const surf = Skia.Surface.Make(16, 16)!;
      const canvas = surf.getCanvas();
      const image = Skia.Surface.Make(8, 8)!.makeImageSnapshot();
      const paint = Skia.Paint();

      // 5 arguments: atlas, srcs, dsts, paint, blendMode (without colors)
      canvas.drawAtlas(
        image,
        [Skia.XYWHRect(0, 0, 8, 8)],
        [Skia.RSXform(1, 0, 0, 0)],
        paint,
        BlendMode.SrcOver
      );

      surf.flush();
      return true;
    });
    expect(result).toBe(true);
  });

  it("drawImage and drawImageRect accept null or omitted paint", async () => {
    const result = await surface.eval((Skia) => {
      const surf = Skia.Surface.Make(16, 16)!;
      const canvas = surf.getCanvas();
      const image = Skia.Surface.Make(8, 8)!.makeImageSnapshot();
      const rect = Skia.XYWHRect(0, 0, 8, 8);

      // drawImage without paint
      canvas.drawImage(image, 0, 0);
      // drawImage with null paint
      canvas.drawImage(image, 0, 0, null);

      // drawImageRect without paint
      canvas.drawImageRect(image, rect, rect);
      // drawImageRect with null paint
      canvas.drawImageRect(image, rect, rect, null);

      surf.flush();
      return true;
    });
    expect(result).toBe(true);
  });

  it("saveLayer accepts null paint", async () => {
    const result = await surface.eval((Skia) => {
      const surf = Skia.Surface.Make(16, 16)!;
      const canvas = surf.getCanvas();
      const rect = Skia.XYWHRect(0, 0, 16, 16);

      const count = canvas.saveLayer(null, rect);
      canvas.restoreToCount(count);

      surf.flush();
      return true;
    });
    expect(result).toBe(true);
  });

  it("drawPoints does not throw when points array is empty", async () => {
    const result = await surface.eval((Skia) => {
      const surf = Skia.Surface.Make(16, 16)!;
      const canvas = surf.getCanvas();
      const paint = Skia.Paint();

      canvas.drawPoints(PointMode.Points, [], paint);
      canvas.drawPoints(PointMode.Lines, [], paint);
      canvas.drawPoints(PointMode.Polygon, [], paint);

      surf.flush();
      return true;
    });
    expect(result).toBe(true);
  });
});

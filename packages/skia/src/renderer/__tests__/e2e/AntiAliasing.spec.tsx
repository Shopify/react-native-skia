import { checkImage } from "../../../__tests__/setup";
import { FilterMode, MipmapMode, PaintStyle } from "../../../skia/types";
import { surface } from "../setup";

// Draws a shape anti-aliased on a small offscreen surface, then magnifies the
// result with nearest-neighbor sampling and overlays a grid where each cell
// matches one source pixel. This makes the AA coverage values at the shape
// edges directly visible, using Skia as the reference implementation.
const SRC_SIZE = 32;
const ZOOM = 8;

// The drawOffscreen callbacks are self-contained (no closures over helpers)
// because they get serialized when the test runs against a device.
const magnifyCtx = {
  size: SRC_SIZE,
  zoom: ZOOM,
  nearest: FilterMode.Nearest,
  noMipmap: MipmapMode.None,
  stroke: PaintStyle.Stroke,
};

describe("Anti-aliasing", () => {
  it("should magnify an anti-aliased circle 8x with a pixel grid", async () => {
    const image = await surface.drawOffscreen((Skia, canvas, ctx) => {
      const draw = (c: typeof canvas) => {
        const paint = Skia.Paint();
        paint.setAntiAlias(true);
        paint.setColor(Skia.Color("black"));
        c.drawCircle(ctx.size / 2, ctx.size / 2, ctx.size / 2 - 3, paint);
      };
      const src = Skia.Surface.MakeOffscreen(ctx.size, ctx.size)!;
      const srcCanvas = src.getCanvas();
      srcCanvas.clear(Skia.Color("white"));
      draw(srcCanvas);
      src.flush();
      const snapshot = src.makeImageSnapshot();
      const dstSize = ctx.size * ctx.zoom;
      canvas.drawImageRectOptions(
        snapshot,
        Skia.XYWHRect(0, 0, ctx.size, ctx.size),
        Skia.XYWHRect(0, 0, dstSize, dstSize),
        ctx.nearest,
        ctx.noMipmap
      );
      const grid = Skia.Paint();
      grid.setColor(Skia.Color("rgba(0, 128, 255, 0.5)"));
      grid.setStyle(ctx.stroke);
      grid.setStrokeWidth(0);
      grid.setAntiAlias(false);
      for (let i = 0; i <= ctx.size; i++) {
        const p = i * ctx.zoom;
        canvas.drawLine(p, 0, p, dstSize, grid);
        canvas.drawLine(0, p, dstSize, p, grid);
      }
    }, magnifyCtx);
    checkImage(image, "snapshots/aa/circle-8x.png");
  });

  it("should magnify an anti-aliased bezier curve 8x with a pixel grid", async () => {
    const image = await surface.drawOffscreen((Skia, canvas, ctx) => {
      const draw = (c: typeof canvas) => {
        const paint = Skia.Paint();
        paint.setAntiAlias(true);
        paint.setColor(Skia.Color("black"));
        paint.setStyle(ctx.stroke);
        paint.setStrokeWidth(2);
        const path = Skia.PathBuilder.Make()
          .moveTo(2, 28)
          .cubicTo(8, -8, 24, 40, 30, 4)
          .detach();
        c.drawPath(path, paint);
      };
      const src = Skia.Surface.MakeOffscreen(ctx.size, ctx.size)!;
      const srcCanvas = src.getCanvas();
      srcCanvas.clear(Skia.Color("white"));
      draw(srcCanvas);
      src.flush();
      const snapshot = src.makeImageSnapshot();
      const dstSize = ctx.size * ctx.zoom;
      canvas.drawImageRectOptions(
        snapshot,
        Skia.XYWHRect(0, 0, ctx.size, ctx.size),
        Skia.XYWHRect(0, 0, dstSize, dstSize),
        ctx.nearest,
        ctx.noMipmap
      );
      const grid = Skia.Paint();
      grid.setColor(Skia.Color("rgba(0, 128, 255, 0.5)"));
      grid.setStyle(ctx.stroke);
      grid.setStrokeWidth(0);
      grid.setAntiAlias(false);
      for (let i = 0; i <= ctx.size; i++) {
        const p = i * ctx.zoom;
        canvas.drawLine(p, 0, p, dstSize, grid);
        canvas.drawLine(0, p, dstSize, p, grid);
      }
    }, magnifyCtx);
    checkImage(image, "snapshots/aa/bezier-8x.png");
  });
});

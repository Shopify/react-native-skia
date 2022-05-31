import { BlendMode, PaintStyle, StrokeCap } from "../types";

import { processResult, setupSkia } from "./snapshot";

describe("Drawings", () => {
  it("Draws a lightblue rectange", () => {
    const { surface, canvas, Skia } = setupSkia();
    const paint = Skia.Paint();
    paint.setColor(Skia.Color("lightblue"));
    const rct = Skia.XYWHRect(64, 64, 128, 128);
    canvas.drawRect(rct, paint);
    processResult(surface, "snapshots/drawings/lightblue-rect.png");
  });

  it("Test multiply blend mode", () => {
    const { surface, canvas, width, height, Skia } = setupSkia();
    const r = 0.37 * width;

    const paint = Skia.Paint();
    paint.setAntiAlias(true);
    paint.setBlendMode(BlendMode.Multiply);

    const cyan = paint.copy();
    cyan.setColor(Skia.Color("cyan"));
    canvas.drawCircle(r, r, r, cyan);
    // Magenta Circle
    const magenta = paint.copy();
    magenta.setColor(Skia.Color("magenta"));
    canvas.drawCircle(width - r, r, r, magenta);
    // Yellow Circle
    const yellow = paint.copy();
    yellow.setColor(Skia.Color("yellow"));
    canvas.drawCircle(width / 2, height - r, r, yellow);

    processResult(surface, "snapshots/drawings/blend-modes.png");
  });

  it("Draw a circle", () => {
    const { surface, canvas, Skia } = setupSkia();

    const r = 128;

    const paint = Skia.Paint();
    paint.setAntiAlias(true);

    paint.setColor(Skia.Color("cyan"));
    canvas.drawCircle(r, r, r, paint);

    processResult(surface, "snapshots/drawings/cyan-circle.png");
  });

  it("Draw a stroke", () => {
    const { surface, canvas, Skia } = setupSkia();

    const paint = Skia.Paint();
    paint.setAntiAlias(true);

    paint.setColor(Skia.Color("cyan"));
    paint.setStyle(PaintStyle.Stroke);
    paint.setStrokeWidth(10);
    const rect = Skia.XYWHRect(64, 64, 128, 128);
    canvas.drawRect(rect, paint);

    processResult(surface, "snapshots/drawings/stroke.png");
  });

  it("Draw a line", () => {
    const { surface, canvas, width, height, Skia } = setupSkia();

    const paint = Skia.Paint();
    paint.setAntiAlias(true);

    paint.setColor(Skia.Color("cyan"));
    paint.setStyle(PaintStyle.Stroke);
    paint.setStrokeWidth(10);
    paint.setStrokeCap(StrokeCap.Round);
    canvas.drawLine(32, 32, width - 32, height - 32, paint);

    processResult(surface, "snapshots/drawings/line.png");
  });
});

import React from "react";

import { checkImage, docPath } from "../../../__tests__/setup";
import { Circle } from "../../components";
import { surface, importSkia } from "../setup";

describe("Offscreen Drawings", () => {
  it("Should use the canvas API to build an image", async () => {
    const { width, height } = surface;
    const raw = await surface.eval(
      (Skia, ctx) => {
        const r = ctx.width / 2;
        return Skia.Surface.drawAsImage(
          (canvas) => {
            const paint = Skia.Paint();
            paint.setColor(Skia.Color("lightblue"));
            canvas.drawCircle(r, r, r, paint);
          },
          ctx.width,
          ctx.height
        ).encodeToBase64();
      },
      { width, height }
    );
    const { Skia } = importSkia();
    const data = Skia.Data.fromBase64(raw);
    const image = Skia.Image.MakeImageFromEncoded(data)!;
    expect(data).toBeDefined();
    checkImage(image, docPath("offscreen/circle.png"));
  });
  it("Should use the React API to build an image", async () => {
    const { width, height } = surface;
    const { drawAsImage } = importSkia();
    const r = width / 2;
    const image = drawAsImage(
      <Circle r={r} cx={r} cy={r} color="lightblue" />,
      width,
      height
    );
    checkImage(image, docPath("offscreen/circle.png"));
  });
});

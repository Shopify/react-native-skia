import type { ReactNode } from "react";
import React from "react";

import { useDrawing, useBounds } from "../nodes/Drawing";
import { bounds } from "../processors";
import { BlendMode, ClipOp, Skia } from "../../skia";
// Here we ask the user to provide the bounds of content
// We could compute it ourselve but prefer not to unless
// other similar use-cases come up
interface MaskProps {
  mode: "luminance" | "alpha";
  mask: ReactNode | ReactNode[];
  children: ReactNode | ReactNode[];
}

export const Mask = ({ mask, children, ...props }: MaskProps) => {
  const onDraw = useDrawing(props, (ctx, { mode }, node) => {
    const { canvas, paint } = ctx;
    const content = node.children.slice(1);
    const clipRect = bounds(content.map((child) => child.bounds(ctx)));
    const maskPaint = Skia.Paint();
    if (mode === "luminance") {
      maskPaint.setColorFilter(Skia.ColorFilter.MakeLumaColorFilter());
    }
    canvas.saveLayer(maskPaint);
    canvas.clipRect(clipRect, ClipOp.Intersect, true);
    node.children[0].draw(ctx);
    canvas.restore();
    canvas.save();
    const p = paint.copy();
    p.setBlendMode(BlendMode.SrcIn);
    ctx.paint = p;
    content.forEach((child) => {
      child.draw(ctx);
    });
    canvas.restore();
  });
  const onBounds = useBounds(props, (ctx, _, node) => {
    return bounds(node.children.map((child) => child.bounds(ctx)));
  });
  return (
    <skDrawing onBounds={onBounds} onDraw={onDraw}>
      {mask}
      {children}
    </skDrawing>
  );
};

Mask.defaultProps = {
  mode: "alpha",
};

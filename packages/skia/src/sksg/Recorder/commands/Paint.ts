import { enumKey, processColor } from "../../../dom/nodes";
import type { PaintProps } from "../../../dom/types";
import {
  BlendMode,
  PaintStyle,
  StrokeCap,
  StrokeJoin,
} from "../../../skia/types";
import type { Skia } from "../../../skia/types";
import type { DrawingContext } from "../DrawingContext";

export const setPaintProperties = (
  Skia: Skia,
  ctx: DrawingContext,
  {
    opacity,
    color,
    blendMode,
    strokeWidth,
    style,
    strokeJoin,
    strokeCap,
    strokeMiter,
    antiAlias,
    dither,
  }: PaintProps,
  standalone: boolean
) => {
  "worklet";
  const { paint } = ctx;

  if (opacity !== undefined) {
    if (standalone) {
      paint.setAlphaf(paint.getAlphaf() * opacity);
    } else {
      ctx.setOpacity(ctx.getOpacity() * opacity);
    }
  }
  if (color !== undefined) {
    paint.setShader(null);
    paint.setColor(processColor(Skia, color));
  }
  if (blendMode !== undefined) {
    paint.setBlendMode(BlendMode[enumKey(blendMode)]);
  }
  if (strokeWidth !== undefined) {
    paint.setStrokeWidth(strokeWidth);
  }
  if (style !== undefined) {
    paint.setStyle(PaintStyle[enumKey(style)]);
  }
  if (strokeJoin !== undefined) {
    paint.setStrokeJoin(StrokeJoin[enumKey(strokeJoin)]);
  }
  if (strokeCap !== undefined) {
    paint.setStrokeCap(StrokeCap[enumKey(strokeCap)]);
  }
  if (strokeMiter !== undefined) {
    paint.setStrokeMiter(strokeMiter);
  }
  if (antiAlias !== undefined) {
    paint.setAntiAlias(antiAlias);
  }
  if (dither !== undefined) {
    paint.setDither(dither);
  }
};

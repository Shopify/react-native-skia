import { enumKey, processColor } from "../../../dom/nodes";
import type { PaintProps } from "../../../dom/types";
import {
  BlendMode,
  PaintStyle,
  StrokeCap,
  StrokeJoin,
} from "../../../skia/types";
import type { SkPaint, Skia } from "../../../skia/types";

export const setPaintProperties = (
  Skia: Skia,
  paint: SkPaint,
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
  }: PaintProps
) => {
  "worklet";
  if (opacity !== undefined) {
    paint.setOpacityPriv(paint.getOpacityPriv() * opacity);
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

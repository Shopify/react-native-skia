import {
  BlendMode,
  PaintStyle,
  StrokeJoin,
  StrokeCap,
  isShader,
  isMaskFilter,
  isColorFilter,
  isPathEffect,
  isImageFilter,
} from "../../skia/types";
import type { SkPaint, SkImageFilter, Skia } from "../../skia/types";
import type { DeclarationResult } from "../nodes";
import type { PaintProps } from "../../dom/types";
import { enumKey, processColor } from "../../dom/nodes/datatypes";

export type CustomPaintProps = PaintProps;

export const processPaint = (
  Skia: Skia,
  paint: SkPaint,
  currentOpacity: number,
  {
    paint: paintRef,
    color,
    blendMode,
    style,
    strokeWidth,
    strokeJoin,
    strokeCap,
    strokeMiter,
    opacity,
    antiAlias,
  }: PaintProps,
  children: DeclarationResult[]
) => {
  if (paintRef && paintRef.current) {
    return paintRef.current;
  }
  if (color !== undefined) {
    const c = processColor(Skia, color, currentOpacity);
    paint.setShader(null);
    paint.setColor(c);
  } else {
    const c = processColor(Skia, paint.getColor(), currentOpacity);
    paint.setColor(c);
  }
  if (blendMode !== undefined) {
    paint.setBlendMode(BlendMode[enumKey(blendMode)]);
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
  if (strokeWidth !== undefined) {
    paint.setStrokeWidth(strokeWidth);
  }
  if (opacity !== undefined) {
    paint.setAlphaf(opacity);
  }
  if (antiAlias !== undefined) {
    paint.setAntiAlias(antiAlias);
  }
  children.forEach((child) => {
    if (isShader(child)) {
      paint.setShader(child);
    } else if (isMaskFilter(child)) {
      paint.setMaskFilter(child);
    } else if (isColorFilter(child)) {
      paint.setColorFilter(child);
    } else if (isPathEffect(child)) {
      paint.setPathEffect(child);
    }
  });
  const filters = children.filter(isImageFilter);
  if (filters.length > 0) {
    paint.setImageFilter(
      filters
        .reverse()
        .reduce<SkImageFilter | null>(
          (...args: Parameters<typeof Skia.ImageFilter.MakeCompose>) =>
            Skia.ImageFilter.MakeCompose(...args),
          null
        )
    );
  }
  return paint;
};

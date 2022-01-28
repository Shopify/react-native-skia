import type { RefObject } from "react";

import { BlendMode, PaintStyle, StrokeJoin, StrokeCap } from "../../skia";
import type { IPaint } from "../../skia";

import type { ChildrenProps } from "./Shapes";
import type { ColorProp } from "./Colors";
import { processColor } from "./Colors";

export type SkEnum<T> = Uncapitalize<keyof T extends string ? keyof T : never>;

export interface CustomPaintProps extends ChildrenProps {
  paint?: RefObject<IPaint>;
  color?: ColorProp;
  strokeWidth?: number;
  blendMode?: SkEnum<typeof BlendMode>;
  style?: SkEnum<typeof PaintStyle>;
  strokeJoin?: SkEnum<typeof StrokeJoin>;
  strokeCap?: SkEnum<typeof StrokeCap>;
  strokeMiter?: number;
  opacity?: number;
}

export const enumKey = <K extends string>(k: K) =>
  (k.charAt(0).toUpperCase() + k.slice(1)) as Capitalize<K>;

export const processPaint = (
  paint: IPaint,
  currentOpacity: number,
  {
    color,
    blendMode,
    style,
    strokeWidth,
    strokeJoin,
    strokeCap,
    strokeMiter,
    opacity,
  }: CustomPaintProps
) => {
  if (color !== undefined) {
    const c = processColor(color, currentOpacity);
    paint.setShader(null);
    paint.setColor(c);
  } else {
    const c = processColor(paint.getColor(), currentOpacity);
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
};

export const selectPaint = (
  currentPaint: IPaint,
  {
    paint,
    color: cl,
    blendMode,
    style: paintStyle,
    strokeWidth,
    strokeJoin,
    strokeCap,
    strokeMiter,
    opacity,
  }: CustomPaintProps
) => {
  const hasCustomPaint =
    cl !== undefined ||
    blendMode !== undefined ||
    paintStyle !== undefined ||
    strokeWidth !== undefined ||
    strokeJoin !== undefined ||
    opacity !== undefined ||
    strokeCap !== undefined ||
    strokeMiter !== undefined;
  const parentPaint = paint?.current ?? currentPaint;
  if (hasCustomPaint) {
    return parentPaint.copy();
  }
  return parentPaint;
};

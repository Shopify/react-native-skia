import type { RefObject } from "react";
import { useRef } from "react";

import {
  Skia,
  BlendMode,
  PaintStyle,
  StrokeJoin,
  StrokeCap,
} from "../../../skia";
import type { IRuntimeEffect, IPaint } from "../../../skia";

export const useRTRef = () => useRef<IRuntimeEffect>(null);
export const usePaintRef = () => useRef<IPaint>(null);

export type SkEnum<T> = Uncapitalize<keyof T extends string ? keyof T : never>;

export interface CustomPaintProps {
  paint?: RefObject<IPaint>;
  color?: string;
  strokeWidth?: number;
  blendMode?: SkEnum<typeof BlendMode>;
  paintStyle?: SkEnum<typeof PaintStyle>;
  strokeJoin?: SkEnum<typeof StrokeJoin>;
  strokeCap?: SkEnum<typeof StrokeCap>;
  strokeMiter?: number;
  opacity?: number;
}

export const enumKey = <K extends string>(k: K) =>
  (k.charAt(0).toUpperCase() + k.slice(1)) as Capitalize<K>;

// TODO: add support for currentOpacity
export const processColor = (color: string, currentOpacity: number) =>
  Skia.Color(color);

export const processPaint = (
  paint: IPaint,
  currentOpacity: number,
  {
    color,
    blendMode,
    paintStyle,
    strokeWidth,
    strokeJoin,
    strokeCap,
    strokeMiter,
    opacity,
  }: CustomPaintProps
) => {
  if (color !== undefined) {
    const c = processColor(color, currentOpacity);
    paint.setColor(c);
  } else {
    const c = paint.getColor();
    paint.setColor([c[0], c[1], c[2], c[3] * currentOpacity]);
  }
  if (blendMode !== undefined) {
    const t = enumKey(blendMode);
    paint.setBlendMode(BlendMode[t]);
  }
  if (paintStyle !== undefined) {
    paint.setStyle(PaintStyle[enumKey(paintStyle)]);
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
    color,
    blendMode,
    paintStyle,
    strokeWidth,
    strokeJoin,
    strokeCap,
    strokeMiter,
    opacity,
  }: CustomPaintProps
) => {
  const hasCustomPaint =
    color !== undefined ||
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

"worklet";

import { enumKey } from "../../dom/nodes";
import type { PaintProps } from "../../dom/types";
import { BlendMode, PaintStyle, StrokeCap, StrokeJoin } from "../../skia/types";
import type { DeclarationContext } from "../DeclarationContext";

export const declarePaint = (ctx: DeclarationContext, props: PaintProps) => {
  const {
    color,
    strokeWidth,
    blendMode,
    style,
    strokeJoin,
    strokeCap,
    strokeMiter,
    opacity,
    antiAlias,
    dither,
  } = props;
  const paint = ctx.Skia.Paint();
  if (color !== undefined) {
    paint.setColor(ctx.Skia.Color(color));
  }
  if (strokeWidth !== undefined) {
    paint.setStrokeWidth(strokeWidth);
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
  if (opacity !== undefined) {
    paint.setAlphaf(opacity);
  }
  if (antiAlias !== undefined) {
    paint.setAntiAlias(antiAlias);
  }
  if (dither !== undefined) {
    paint.setDither(dither);
  }
  //ctx.save();

  const colorFilter = ctx.colorFilters.popAllAsOne();
  const imageFilter = ctx.imageFilters.popAllAsOne();
  const shader = ctx.shaders.pop();
  const maskFilter = ctx.maskFilters.pop();
  const pathEffect = ctx.pathEffects.popAllAsOne();
  //ctx.restore();
  if (imageFilter) {
    paint.setImageFilter(imageFilter);
  }
  if (shader) {
    paint.setShader(shader);
  }
  if (pathEffect) {
    paint.setPathEffect(pathEffect);
  }
  if (colorFilter) {
    paint.setColorFilter(colorFilter);
  }
  if (maskFilter) {
    paint.setMaskFilter(maskFilter);
  }
  ctx.paints.push(paint);
};

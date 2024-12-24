"worklet";

import { enumKey } from "../../dom/nodes";
import type {
  BlendColorFilterProps,
  LerpColorFilterProps,
  MatrixColorFilterProps,
  PaintProps,
} from "../../dom/types";
import {
  BlendMode,
  PaintStyle,
  StrokeCap,
  StrokeJoin,
  type SkColorFilter,
} from "../../skia/types";
import type { DrawingContext } from "../DrawingContext";

const composeAndPush = (ctx: DrawingContext, cf1: SkColorFilter) => {
  const cf2 = ctx.declCtx.colorFilters.popAllAsOne();
  const cf = cf2 ? ctx.Skia.ColorFilter.MakeCompose(cf1, cf2) : cf1;
  ctx.declCtx.colorFilters.push(cf);
};

export const declareBlendColorFilter = (
  ctx: DrawingContext,
  props: BlendColorFilterProps
) => {
  const { mode } = props;
  const color = ctx.Skia.Color(props.color);
  const cf = ctx.Skia.ColorFilter.MakeBlend(color, BlendMode[enumKey(mode)]);
  composeAndPush(ctx, cf);
};

export const declareSRGBToLinearGammaColorFilter = (ctx: DrawingContext) => {
  const cf = ctx.Skia.ColorFilter.MakeSRGBToLinearGamma();
  composeAndPush(ctx, cf);
};

export const declareLinearToSRGBGammaColorFilter = (ctx: DrawingContext) => {
  const cf = ctx.Skia.ColorFilter.MakeLinearToSRGBGamma();
  composeAndPush(ctx, cf);
};

export const declarePaint = (ctx: DrawingContext, props: PaintProps) => {
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

  const colorFilter = ctx.declCtx.colorFilters.popAllAsOne();
  const imageFilter = ctx.declCtx.imageFilters.popAllAsOne();
  const shader = ctx.declCtx.shaders.pop();
  const maskFilter = ctx.declCtx.maskFilters.pop();
  const pathEffect = ctx.declCtx.pathEffects.popAllAsOne();
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
  ctx.declCtx.paints.push(paint);
};

export const declareLerpColorFilter = (
  ctx: DrawingContext,
  props: LerpColorFilterProps
) => {
  const { t } = props;
  const second = ctx.declCtx.colorFilters.pop();
  const first = ctx.declCtx.colorFilters.pop();
  if (!first || !second) {
    throw new Error(
      "LerpColorFilterNode: missing two color filters as children"
    );
  }
  ctx.declCtx.colorFilters.push(
    ctx.Skia.ColorFilter.MakeLerp(t, first, second)
  );
};

export const declareMatrixColorFilter = (
  ctx: DrawingContext,
  props: MatrixColorFilterProps
) => {
  const { matrix } = props;
  const cf = ctx.Skia.ColorFilter.MakeMatrix(matrix);
  composeAndPush(ctx, cf);
};

"worklet";

import { enumKey, processRadius } from "../../dom/nodes";
import type {
  BlendImageFilterProps,
  BlurImageFilterProps,
  BlurMaskFilterProps,
  DeclarationContext,
  DisplacementMapImageFilterProps,
  DropShadowImageFilterProps,
  MorphologyImageFilterProps,
  OffsetImageFilterProps,
  RuntimeShaderImageFilterProps,
} from "../../dom/types";
import type { SkColor, Skia, SkImageFilter } from "../../skia/types";
import {
  BlendMode,
  BlurStyle,
  ColorChannel,
  processUniforms,
  TileMode,
} from "../../skia/types";

export enum MorphologyOperator {
  Erode,
  Dilate,
}

const Black = Float32Array.of(0, 0, 0, 1);

const MakeInnerShadow = (
  Skia: Skia,
  shadowOnly: boolean | undefined,
  dx: number,
  dy: number,
  sigmaX: number,
  sigmaY: number,
  color: SkColor,
  input: SkImageFilter | null
) => {
  const sourceGraphic = Skia.ImageFilter.MakeColorFilter(
    Skia.ColorFilter.MakeBlend(Black, BlendMode.Dst),
    null
  );
  const sourceAlpha = Skia.ImageFilter.MakeColorFilter(
    Skia.ColorFilter.MakeBlend(Black, BlendMode.SrcIn),
    null
  );
  const f1 = Skia.ImageFilter.MakeColorFilter(
    Skia.ColorFilter.MakeBlend(color, BlendMode.SrcOut),
    null
  );
  const f2 = Skia.ImageFilter.MakeOffset(dx, dy, f1);
  const f3 = Skia.ImageFilter.MakeBlur(sigmaX, sigmaY, TileMode.Decal, f2);
  const f4 = Skia.ImageFilter.MakeBlend(BlendMode.SrcIn, sourceAlpha, f3);
  if (shadowOnly) {
    return f4;
  }
  return Skia.ImageFilter.MakeCompose(
    input,
    Skia.ImageFilter.MakeBlend(BlendMode.SrcOver, sourceGraphic, f4)
  );
};

const input = (ctx: DeclarationContext) => {
  return ctx.imageFilters.pop() ?? null;
};

export const makeOffsetImageFilter = (
  ctx: DeclarationContext,
  props: OffsetImageFilterProps
) => {
  const { x, y } = props;
  return ctx.Skia.ImageFilter.MakeOffset(x, y, null);
};

export const declareDisplacementMapImageFilter = (
  ctx: DeclarationContext,
  props: DisplacementMapImageFilterProps
) => {
  const { channelX, channelY, scale } = props;
  const shader = ctx.shaders.pop();
  if (!shader) {
    throw new Error("DisplacementMap expects a shader as child");
  }
  const map = ctx.Skia.ImageFilter.MakeShader(shader, null);
  const imgf = ctx.Skia.ImageFilter.MakeDisplacementMap(
    ColorChannel[enumKey(channelX)],
    ColorChannel[enumKey(channelY)],
    scale,
    map,
    input(ctx)
  );
  ctx.imageFilters.push(imgf);
};

export const makeBlurImageFilter = (
  ctx: DeclarationContext,
  props: BlurImageFilterProps
) => {
  const { mode, blur } = props;
  const sigma = processRadius(ctx.Skia, blur);
  const imgf = ctx.Skia.ImageFilter.MakeBlur(
    sigma.x,
    sigma.y,
    TileMode[enumKey(mode)],
    input(ctx)
  );
  return imgf;
};

export const makeDropShadowImageFilter = (
  ctx: DeclarationContext,
  props: DropShadowImageFilterProps
) => {
  const { dx, dy, blur, shadowOnly, color: cl, inner } = props;
  const color = ctx.Skia.Color(cl);
  let factory;
  if (inner) {
    factory = MakeInnerShadow.bind(null, ctx.Skia, shadowOnly);
  } else {
    factory = shadowOnly
      ? ctx.Skia.ImageFilter.MakeDropShadowOnly.bind(ctx.Skia.ImageFilter)
      : ctx.Skia.ImageFilter.MakeDropShadow.bind(ctx.Skia.ImageFilter);
  }
  const imgf = factory(dx, dy, blur, blur, color, input(ctx));
  return imgf;
};

export const makeMorphologyImageFilter = (
  ctx: DeclarationContext,
  props: MorphologyImageFilterProps
) => {
  const { operator } = props;
  const r = processRadius(ctx.Skia, props.radius);
  let imgf;
  if (MorphologyOperator[enumKey(operator)] === MorphologyOperator.Erode) {
    imgf = ctx.Skia.ImageFilter.MakeErode(r.x, r.y, input(ctx));
  } else {
    imgf = ctx.Skia.ImageFilter.MakeDilate(r.x, r.y, input(ctx));
  }
  return imgf;
};

export const makeRuntimeShaderImageFilter = (
  ctx: DeclarationContext,
  props: RuntimeShaderImageFilterProps
) => {
  const { source, uniforms } = props;
  const rtb = ctx.Skia.RuntimeShaderBuilder(source);
  if (uniforms) {
    processUniforms(source, uniforms, rtb);
  }
  const imgf = ctx.Skia.ImageFilter.MakeRuntimeShader(rtb, null, input(ctx));
  return imgf;
};

export const declareBlendImageFilter = (
  ctx: DeclarationContext,
  props: BlendImageFilterProps
) => {
  const { mode } = props;
  const a = ctx.imageFilters.pop();
  const b = ctx.imageFilters.pop();
  if (!a || !b) {
    throw new Error("BlendImageFilter requires two image filters");
  }
  const imgf = ctx.Skia.ImageFilter.MakeBlend(mode, a, b);
  ctx.imageFilters.push(imgf);
};

export const declareBlurMaskFilter = (
  ctx: DeclarationContext,
  props: BlurMaskFilterProps
) => {
  const { blur, style, respectCTM } = props;
  const mf = ctx.Skia.MaskFilter.MakeBlur(
    BlurStyle[enumKey(style)],
    blur,
    respectCTM
  );
  ctx.maskFilters.push(mf);
};

"worklet";

import { composeDeclarations, enumKey, processRadius } from "../../dom/nodes";
import type {
  BlendImageFilterProps,
  BlendProps,
  BlurImageFilterProps,
  BlurMaskFilterProps,
  DeclarationContext,
  DisplacementMapImageFilterProps,
  DropShadowImageFilterProps,
  MorphologyImageFilterProps,
  OffsetImageFilterProps,
} from "../../dom/types";
import type { SkColor, Skia, SkImageFilter } from "../../skia/types";
import { BlendMode, BlurStyle, ColorChannel, TileMode } from "../../skia/types";
import type { DrawingContext } from "../DrawingContext";

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

const composeAndPush = (ctx: DrawingContext, imgf1: SkImageFilter) => {
  let imgf2 = ctx.declCtx.imageFilters.popAllAsOne();
  const cf = ctx.declCtx.colorFilters.popAllAsOne();
  if (cf) {
    imgf2 = ctx.Skia.ImageFilter.MakeCompose(
      imgf2 ?? null,
      ctx.Skia.ImageFilter.MakeColorFilter(cf, null)
    );
  }
  const imgf = imgf2 ? ctx.Skia.ImageFilter.MakeCompose(imgf1, imgf2) : imgf1;
  ctx.declCtx.imageFilters.push(imgf);
};

export const declareBlend = (ctx: DrawingContext, props: BlendProps) => {
  const { Skia } = ctx;
  const blend = BlendMode[enumKey(props.mode)];
  // Blend ImageFilters
  const imageFilters = ctx.declCtx.imageFilters.popAll();
  if (imageFilters.length > 0) {
    const composer = Skia.ImageFilter.MakeBlend.bind(Skia.ImageFilter, blend);
    ctx.declCtx.imageFilters.push(composeDeclarations(imageFilters, composer));
  }
  // Blend Shaders
  const shaders = ctx.declCtx.shaders.popAll();
  if (shaders.length > 0) {
    const composer = Skia.Shader.MakeBlend.bind(Skia.Shader, blend);
    ctx.declCtx.shaders.push(composeDeclarations(shaders, composer));
  }
};
export const declareBlurMaskFilter = (
  ctx: DrawingContext,
  props: BlurMaskFilterProps
) => {
  const { style, blur, respectCTM } = props;
  const mf = ctx.Skia.MaskFilter.MakeBlur(
    BlurStyle[enumKey(style)],
    blur,
    respectCTM
  );
  ctx.declCtx.maskFilters.push(mf);
};

export const declareDisplacementMapImageFilter = (
  ctx: DrawingContext,
  props: DisplacementMapImageFilterProps
) => {
  const { channelX, channelY, scale } = props;
  const shader = ctx.declCtx.shaders.pop();
  if (!shader) {
    throw new Error("DisplacementMap expects a shader as child");
  }
  const map = ctx.Skia.ImageFilter.MakeShader(shader, null);
  const imgf = ctx.Skia.ImageFilter.MakeDisplacementMap(
    ColorChannel[enumKey(channelX)],
    ColorChannel[enumKey(channelY)],
    scale,
    map,
    input(ctx.declCtx)
  );
  ctx.declCtx.imageFilters.push(imgf);
};

export const declareDropShadowImageFilter = (
  ctx: DrawingContext,
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
  const imgf = factory(dx, dy, blur, blur, color, input(ctx.declCtx));
  composeAndPush(ctx, imgf);
};

export const declareOffsetImageFilter = (
  ctx: DrawingContext,
  props: OffsetImageFilterProps
) => {
  const { x, y } = props;
  const imgf = ctx.Skia.ImageFilter.MakeOffset(x, y, null);
  composeAndPush(ctx, imgf);
};

export const declareBlendImageFilter = (
  ctx: DrawingContext,
  props: BlendImageFilterProps
) => {
  const { mode } = props;
  const a = ctx.declCtx.imageFilters.pop();
  const b = ctx.declCtx.imageFilters.pop();
  if (!a || !b) {
    throw new Error("BlendImageFilter requires two image filters");
  }
  const imgf = ctx.Skia.ImageFilter.MakeBlend(mode, a, b);
  composeAndPush(ctx, imgf);
};

export const declareMorphologyImageFilter = (
  ctx: DrawingContext,
  props: MorphologyImageFilterProps
) => {
  const { operator } = props;
  const r = processRadius(ctx.Skia, props.radius);
  let imgf;
  if (MorphologyOperator[enumKey(operator)] === MorphologyOperator.Erode) {
    imgf = ctx.Skia.ImageFilter.MakeErode(r.x, r.y, input(ctx.declCtx));
  } else {
    imgf = ctx.Skia.ImageFilter.MakeDilate(r.x, r.y, input(ctx.declCtx));
  }
  composeAndPush(ctx, imgf);
};

export const declareBlurImageFilter = (
  ctx: DrawingContext,
  props: BlurImageFilterProps
) => {
  const { mode, blur } = props;
  const sigma = processRadius(ctx.Skia, blur);
  const imgf = ctx.Skia.ImageFilter.MakeBlur(
    sigma.x,
    sigma.y,
    TileMode[enumKey(mode)],
    input(ctx.declCtx)
  );
  composeAndPush(ctx, imgf);
};

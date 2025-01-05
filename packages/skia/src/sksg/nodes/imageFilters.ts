import { enumKey, processRadius } from "../../dom/nodes";
import type {
  BlendImageFilterProps,
  BlendProps,
  BlurImageFilterProps,
  BlurMaskFilterProps,
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
import type { DeclarationContext } from "../DeclarationContext";
import { composeDeclarations } from "../DeclarationContext";

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
  "worklet";
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

export const declareBlend = (ctx: DeclarationContext, props: BlendProps) => {
  "worklet";
  const { Skia } = ctx;
  const blend = BlendMode[enumKey(props.mode as BlendProps["mode"])];
  // Blend ImageFilters
  const imageFilters = ctx.imageFilters.popAll();
  if (imageFilters.length > 0) {
    const composer = Skia.ImageFilter.MakeBlend.bind(Skia.ImageFilter, blend);
    ctx.imageFilters.push(composeDeclarations(imageFilters, composer));
  }
  // Blend Shaders
  const shaders = ctx.shaders.popAll();
  if (shaders.length > 0) {
    const composer = Skia.Shader.MakeBlend.bind(Skia.Shader, blend);
    ctx.shaders.push(composeDeclarations(shaders, composer));
  }
};

export const composeImageFilters = (
  ctx: DeclarationContext,
  imgf1: SkImageFilter,
  processChildren: () => void
) => {
  "worklet";
  const { Skia } = ctx;
  ctx.imageFilters.save();
  ctx.colorFilters.save();
  processChildren();
  let imgf2 = ctx.imageFilters.popAllAsOne();
  const cf = ctx.colorFilters.popAllAsOne();
  ctx.imageFilters.restore();
  ctx.colorFilters.restore();
  if (cf) {
    imgf2 = Skia.ImageFilter.MakeCompose(
      imgf2 ?? null,
      Skia.ImageFilter.MakeColorFilter(cf, null)
    );
  }
  const imgf = imgf2 ? Skia.ImageFilter.MakeCompose(imgf1, imgf2) : imgf1;
  ctx.imageFilters.push(imgf);
};

const input = (ctx: DeclarationContext) => {
  "worklet";
  return ctx.imageFilters.pop() ?? null;
};

export const makeOffsetImageFilter = (
  ctx: DeclarationContext,
  props: OffsetImageFilterProps
) => {
  "worklet";
  const { x, y } = props;
  return ctx.Skia.ImageFilter.MakeOffset(x, y, null);
};

export const declareDisplacementMapImageFilter = (
  ctx: DeclarationContext,
  props: DisplacementMapImageFilterProps
) => {
  "worklet";
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
  "worklet";
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
  "worklet";
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
  "worklet";
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
  "worklet";
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
  "worklet";
  const a = ctx.imageFilters.pop();
  const b = ctx.imageFilters.pop();
  if (!a || !b) {
    throw new Error("BlendImageFilter requires two image filters");
  }
  const imgf = ctx.Skia.ImageFilter.MakeBlend(
    BlendMode[enumKey(props.mode)],
    a,
    b
  );
  ctx.imageFilters.push(imgf);
};

export const declareBlurMaskFilter = (
  ctx: DeclarationContext,
  props: BlurMaskFilterProps
) => {
  "worklet";
  const { blur, style, respectCTM } = props;
  const mf = ctx.Skia.MaskFilter.MakeBlur(
    BlurStyle[enumKey(style)],
    blur,
    respectCTM
  );
  ctx.maskFilters.push(mf);
};

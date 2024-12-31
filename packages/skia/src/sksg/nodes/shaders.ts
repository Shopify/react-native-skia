"worklet";

import {
  enumKey,
  fitRects,
  getRect,
  processGradientProps,
  processTransformProps,
  rect2rect,
} from "../../dom/nodes";
import type {
  ColorProps,
  FractalNoiseProps,
  ImageShaderProps,
  LinearGradientProps,
  RadialGradientProps,
  ShaderProps,
  SweepGradientProps,
  TurbulenceProps,
  TwoPointConicalGradientProps,
} from "../../dom/types";
import {
  FilterMode,
  MipmapMode,
  processUniforms,
  TileMode,
} from "../../skia/types";
import type { DeclarationContext } from "../DeclarationContext";

export const declareShader = (ctx: DeclarationContext, props: ShaderProps) => {
  const { source, uniforms, ...transform } = props;
  const m3 = ctx.Skia.Matrix();
  processTransformProps(m3, transform);
  const shader = source.makeShaderWithChildren(
    processUniforms(source, uniforms),
    ctx.shaders.popAll(),
    m3
  );
  ctx.shaders.push(shader);
};

export const declareColorShader = (
  ctx: DeclarationContext,
  props: ColorProps
) => {
  const { color } = props;
  const shader = ctx.Skia.Shader.MakeColor(ctx.Skia.Color(color));
  ctx.shaders.push(shader);
};

export const declareFractalNoiseShader = (
  ctx: DeclarationContext,
  props: FractalNoiseProps
) => {
  const { freqX, freqY, octaves, seed, tileWidth, tileHeight } = props;
  const shader = ctx.Skia.Shader.MakeFractalNoise(
    freqX,
    freqY,
    octaves,
    seed,
    tileWidth,
    tileHeight
  );
  ctx.shaders.push(shader);
};

export const declareTwoPointConicalGradientShader = (
  ctx: DeclarationContext,
  props: TwoPointConicalGradientProps
) => {
  const { startR, endR, start, end } = props;
  const { colors, positions, mode, localMatrix, flags } = processGradientProps(
    ctx.Skia,
    props
  );
  const shader = ctx.Skia.Shader.MakeTwoPointConicalGradient(
    start,
    startR,
    end,
    endR,
    colors,
    positions,
    mode,
    localMatrix,
    flags
  );
  ctx.shaders.push(shader);
};

export const declareRadialGradientShader = (
  ctx: DeclarationContext,
  props: RadialGradientProps
) => {
  const { c, r } = props;
  const { colors, positions, mode, localMatrix, flags } = processGradientProps(
    ctx.Skia,
    props
  );
  const shader = ctx.Skia.Shader.MakeRadialGradient(
    c,
    r,
    colors,
    positions,
    mode,
    localMatrix,
    flags
  );
  ctx.shaders.push(shader);
};

export const declareSweepGradientShader = (
  ctx: DeclarationContext,
  props: SweepGradientProps
) => {
  const { c, start, end } = props;
  const { colors, positions, mode, localMatrix, flags } = processGradientProps(
    ctx.Skia,
    props
  );
  const shader = ctx.Skia.Shader.MakeSweepGradient(
    c.x,
    c.y,
    colors,
    positions,
    mode,
    localMatrix,
    flags,
    start,
    end
  );
  ctx.shaders.push(shader);
};

export const declareLinearGradientShader = (
  ctx: DeclarationContext,
  props: LinearGradientProps
) => {
  const { start, end } = props;
  const { colors, positions, mode, localMatrix, flags } = processGradientProps(
    ctx.Skia,
    props
  );
  const shader = ctx.Skia.Shader.MakeLinearGradient(
    start,
    end,
    colors,
    positions ?? null,
    mode,
    localMatrix,
    flags
  );
  ctx.shaders.push(shader);
};

export const declareTurbulenceShader = (
  ctx: DeclarationContext,
  props: TurbulenceProps
) => {
  const { freqX, freqY, octaves, seed, tileWidth, tileHeight } = props;
  const shader = ctx.Skia.Shader.MakeTurbulence(
    freqX,
    freqY,
    octaves,
    seed,
    tileWidth,
    tileHeight
  );
  ctx.shaders.push(shader);
};

export const declareImageShader = (
  ctx: DeclarationContext,
  props: ImageShaderProps
) => {
  const { fit, image, tx, ty, fm, mm, ...imageShaderProps } = props;
  if (!image) {
    return;
  }

  const rct = getRect(ctx.Skia, imageShaderProps);
  const m3 = ctx.Skia.Matrix();
  if (rct) {
    const rects = fitRects(
      fit,
      { x: 0, y: 0, width: image.width(), height: image.height() },
      rct
    );
    const [x, y, sx, sy] = rect2rect(rects.src, rects.dst);
    m3.translate(x.translateX, y.translateY);
    m3.scale(sx.scaleX, sy.scaleY);
  }
  const lm = ctx.Skia.Matrix();
  lm.concat(m3);
  processTransformProps(lm, imageShaderProps);
  const shader = image.makeShaderOptions(
    TileMode[enumKey(tx)],
    TileMode[enumKey(ty)],
    FilterMode[enumKey(fm)],
    MipmapMode[enumKey(mm)],
    lm
  );
  ctx.shaders.push(shader);
};

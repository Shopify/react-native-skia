"worklet";

import {
  enumKey,
  fitRects,
  getRect,
  processTransformProps,
  rect2rect,
} from "../../dom/nodes";
import type {
  ImageShaderProps,
  ShaderProps,
  TurbulenceProps,
} from "../../dom/types";
import {
  FilterMode,
  MipmapMode,
  processUniforms,
  TileMode,
} from "../../skia/types";
import type { DrawingContext } from "../DrawingContext";

export const declareShader = (ctx: DrawingContext, props: ShaderProps) => {
  const { source, uniforms, ...transform } = props;
  const m3 = ctx.Skia.Matrix();
  processTransformProps(m3, transform);
  const shader = source.makeShaderWithChildren(
    processUniforms(source, uniforms),
    ctx.declCtx.shaders.popAll(),
    m3
  );
  ctx.declCtx.shaders.push(shader);
};

export const declareTurbulenceShader = (
  ctx: DrawingContext,
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
  ctx.declCtx.shaders.push(shader);
};

export const declareImageShader = (
  ctx: DrawingContext,
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
  ctx.declCtx.shaders.push(shader);
};

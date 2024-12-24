"worklet";

import { processTransformProps } from "../../dom/nodes";
import type { ShaderProps } from "../../dom/types";
import { processUniforms } from "../../skia/types";
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

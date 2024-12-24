"worklet";

import { processTransformProps } from "../../dom/nodes";
import type { ShaderProps } from "../../dom/types";
import { processUniforms } from "../../skia/types";
import type { DrawingContext } from "../DrawingContext";

import type { Node } from "./Node";

export const declareShader = (ctx: DrawingContext, node: Node<ShaderProps>) => {
  const { source, uniforms, ...transform } = node.props;
  const m3 = ctx.Skia.Matrix();
  processTransformProps(m3, transform);
  const shader = source.makeShaderWithChildren(
    processUniforms(source, uniforms),
    ctx.declCtx.shaders.popAll(),
    m3
  );
  ctx.declCtx.shaders.push(shader);
};

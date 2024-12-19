/* eslint-disable @typescript-eslint/no-explicit-any */
import { enumKey, processCircle } from "../dom/nodes";
import type {
  BlurMaskFilterProps,
  CircleProps,
  DrawingNodeProps,
  PaintProps,
  TransformProps,
} from "../dom/types";
import { NodeType } from "../dom/types";
import { BlurStyle } from "../skia/types";

import type { DrawingContext } from "./DrawingContext";
import type { Node } from "./Node";

const drawCircle = (ctx: DrawingContext, props: CircleProps) => {
  "worklet";
  const { c } = processCircle(props);
  const { r } = props;
  ctx.canvas.drawCircle(c.x, c.y, r, ctx.paint);
};

const drawFill = (ctx: DrawingContext, _props: DrawingNodeProps) => {
  "worklet";
  ctx.canvas.drawPaint(ctx.paint);
};

interface ContextProcessingResult {
  shouldRestoreMatrix: boolean;
  shouldRestorePaint: boolean;
}

const preProcessContext = (
  ctx: DrawingContext,
  props: PaintProps & TransformProps,
  children: Node<any>[]
) => {
  "worklet";
  const shouldRestoreMatrix = ctx.processMatrix(props);
  ctx.declCtx.save();
  children.forEach((node) => {
    switch (node.type) {
      case NodeType.BlurMaskFilter:
        declareBlurMaskFilter(ctx, node);
        break;
    }
  });
  ctx.declCtx.restore();
  const shouldRestorePaint = ctx.processPaint(props);
  return { shouldRestoreMatrix, shouldRestorePaint };
};

const postProcessContext = (
  ctx: DrawingContext,
  { shouldRestoreMatrix, shouldRestorePaint }: ContextProcessingResult
) => {
  "worklet";
  if (shouldRestoreMatrix) {
    ctx.canvas.restore();
  }
  if (shouldRestorePaint) {
    ctx.restore();
  }
};

const declareBlurMaskFilter = (
  ctx: DrawingContext,
  node: Node<BlurMaskFilterProps>
) => {
  "worklet";
  const { style, blur, respectCTM } = node.props;
  const mf = ctx.Skia.MaskFilter.MakeBlur(
    BlurStyle[enumKey(style)],
    blur,
    respectCTM
  );
  ctx.declCtx.maskFilters.push(mf);
};

const isDrawingNode = (node: Node) => {
  "worklet";
  return (
    node.type === NodeType.Circle ||
    node.type === NodeType.Fill ||
    node.type === NodeType.Group
  );
};

export const draw = (ctx: DrawingContext, node: Node<any>) => {
  "worklet";
  const { type, props, children } = node;
  const result = preProcessContext(ctx, props, children);
  switch (type) {
    case NodeType.Circle:
      drawCircle(ctx, props);
      break;
    case NodeType.Fill:
      drawFill(ctx, props);
      break;
    case NodeType.Group:
      // TODO: do nothing
      break;
    // TODO: exhaustive check
  }
  children.forEach((child) => {
    if (isDrawingNode(child)) {
      draw(ctx, child);
    }
  });
  postProcessContext(ctx, result);
};

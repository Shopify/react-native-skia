import { enumKey, processCircle } from "../dom/nodes";
import type {
  BlurMaskFilterProps,
  CircleProps,
  DrawingNodeProps,
} from "../dom/types";
import { NodeType } from "../dom/types";
import { BlurStyle } from "../skia/types";

import {
  postProcessContext,
  preProcessContext,
  type DrawingContext,
} from "./DrawingContext";
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

const drawBlurMaskFilter = (
  ctx: DrawingContext,
  props: BlurMaskFilterProps
) => {
  "worklet";
  const { style, blur, respectCTM } = props;
  const mf = ctx.Skia.MaskFilter.MakeBlur(
    BlurStyle[enumKey(style)],
    blur,
    respectCTM
  );
  ctx.declCtx.maskFilters.push(mf);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    case NodeType.BlurMaskFilter:
      drawBlurMaskFilter(ctx, props);
      break;
    // TODO: exhaustive check
  }
  children.forEach((child) => {
    draw(ctx, child);
  });
  postProcessContext(ctx, result);
};

import { processCircle } from "../dom/nodes";
import type { CircleProps, DrawingNodeProps } from "../dom/types";
import { NodeType } from "../dom/types";

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
    // TODO: exhaustive check
  }
  postProcessContext(ctx, result);
};

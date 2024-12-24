import { processCircle } from "../../dom/nodes";
import type { CircleProps, DrawingNodeProps } from "../../dom/types";
import type { DrawingContext } from "../DrawingContext";

export const drawCircle = (ctx: DrawingContext, props: CircleProps) => {
  "worklet";
  const { c } = processCircle(props);
  const { r } = props;
  ctx.canvas.drawCircle(c.x, c.y, r, ctx.paint);
};

export const drawFill = (ctx: DrawingContext, _props: DrawingNodeProps) => {
  "worklet";
  ctx.canvas.drawPaint(ctx.paint);
};

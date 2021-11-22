import type { DrawingContext } from "../../CanvasKitView";
import { NodeType } from "../../Host";
import type { SkNode } from "../../Host";
import type { CustomPaintProps } from "../processors";
import { processPaint, selectPaint } from "../processors";

export interface CircleProps extends CustomPaintProps {
  r: number;
  cx: number;
  cy: number;
}

export const Circle = (props: CircleProps) => {
  return <skCircle {...props} />;
};

export const CircleNode = (props: CircleProps): SkNode<NodeType.Circle> => ({
  type: NodeType.Circle,
  props,
  draw: (ctx: DrawingContext, { cx, cy, r, ...circleProps }) => {
    const selectedPaint = selectPaint(ctx.paint, circleProps);
    processPaint(selectedPaint, ctx.opacity, circleProps);
    ctx.canvas.drawCircle(cx, cy, r, selectedPaint);
  },
  children: [],
});

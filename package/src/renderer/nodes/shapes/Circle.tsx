import { NodeType } from "../../Host";
import type { SkNode } from "../../Host";
import type { CustomPaintProps } from "../processors";
import { processPaint, selectPaint } from "../processors";
import type { AnimatedProps } from "../processors/Animations/Animations";
import type { Vector } from "../../math/Vector";
import { materialize } from "../processors/Animations/Animations";

export interface CircleProps extends CustomPaintProps {
  r: number;
  c: Vector;
}

export const Circle = (props: AnimatedProps<CircleProps>) => {
  return <skCircle {...props} />;
};

export const CircleNode = (
  props: AnimatedProps<CircleProps>
): SkNode<NodeType.Circle> => ({
  type: NodeType.Circle,
  props,
  draw: (ctx, newProps) => {
    const { c, r, ...circleProps } = materialize(ctx, newProps);
    const selectedPaint = selectPaint(ctx.paint, circleProps);
    processPaint(selectedPaint, ctx.opacity, circleProps);
    ctx.canvas.drawCircle(c.x, c.y, r, selectedPaint);
  },
  children: [],
});

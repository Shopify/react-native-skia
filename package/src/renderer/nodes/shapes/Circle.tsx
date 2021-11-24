import { NodeType } from "../../Host";
import type { SkNode } from "../../Host";
import type { CustomPaintProps } from "../processors";
import { processPaint, selectPaint } from "../processors";
import type { AnimatedProps } from "../processors/Animations/Animations";

export interface CircleProps extends CustomPaintProps {
  r: number;
  cx: number;
  cy: number;
}

export const Circle = (props: AnimatedProps<CircleProps>) => {
  return <skCircle {...props} />;
};

export const CircleNode = (
  props: AnimatedProps<CircleProps>
): SkNode<NodeType.Circle> => ({
  type: NodeType.Circle,
  props,
  draw: (ctx, { animatedProps, ...remainingProps }) => {
    const circleProps = {
      ...remainingProps,
      ...animatedProps(ctx),
    };
    const { cx, cy, r } = circleProps;
    const selectedPaint = selectPaint(ctx.paint, circleProps);
    processPaint(selectedPaint, ctx.opacity, circleProps);
    ctx.canvas.drawCircle(cx, cy, r, selectedPaint);
  },
  children: [],
});

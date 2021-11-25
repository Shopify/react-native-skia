import type { CustomPaintProps } from "../processors";
import { processPaint, selectPaint } from "../processors";
import type { AnimatedProps } from "../processors/Animations/Animations";
import type { Vector } from "../../math/Vector";
import { materialize } from "../processors/Animations/Animations";
import { useDrawingCallback } from "../Drawing";

export interface CircleProps extends CustomPaintProps {
  r: number;
  c: Vector;
}

export const Circle = (props: AnimatedProps<CircleProps>) => {
  const onDraw = useDrawingCallback(
    (ctx) => {
      const { c, r, ...circleProps } = materialize(ctx, props);
      const selectedPaint = selectPaint(ctx.paint, circleProps);
      processPaint(selectedPaint, ctx.opacity, circleProps);
      ctx.canvas.drawCircle(c.x, c.y, r, selectedPaint);
    },
    [props]
  );
  return <skDrawing onDraw={onDraw} />;
};

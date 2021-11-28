import type { CustomPaintProps, Vector, AnimatedProps } from "../../processors";
import { materialize } from "../../processors";
import { useDrawing } from "../../nodes/Drawing";

export interface CircleProps extends CustomPaintProps {
  r: number;
  c: Vector;
}

export const Circle = (props: AnimatedProps<CircleProps>) => {
  const onDraw = useDrawing(
    (ctx) => {
      const { canvas, paint } = ctx;
      const { c, r } = materialize(ctx, props);
      canvas.drawCircle(c.x, c.y, r, paint);
    },
    [props]
  );
  return <skDrawing onDraw={onDraw} {...props} />;
};

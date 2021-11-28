import type { CustomPaintProps } from "../processors";
import type { AnimatedProps } from "../processors/Animations/Animations";
import type { Vector } from "../../math/Vector";
import { materialize } from "../processors/Animations";
import { useDrawing } from "../Drawing";

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

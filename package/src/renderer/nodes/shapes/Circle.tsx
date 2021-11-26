import type { CustomPaintProps } from "../processors";
import type { AnimatedProps } from "../processors/Animations/Animations";
import type { Vector } from "../../math/Vector";
import { materialize, useFrame } from "../processors/Animations";

export interface CircleProps extends CustomPaintProps {
  r: number;
  c: Vector;
}

export const Circle = (props: AnimatedProps<CircleProps>) => {
  const onDraw = useFrame(
    (ctx) => {
      const { canvas, paint } = ctx;
      const { c, r } = materialize(ctx, props);
      canvas.drawCircle(c.x, c.y, r, paint);
    },
    [props]
  );
  return <skDrawing onDraw={onDraw} {...props} />;
};

import type { CustomPaintProps } from "../processors";
import type { Vector } from "../../math/Vector";
import type { AnimatedProps } from "../processors/Animations/Animations";
import { materialize } from "../processors/Animations/Animations";
import { useDrawing } from "../Drawing";

export interface LineProps extends CustomPaintProps {
  p1: Vector;
  p2: Vector;
}

export const Line = (props: AnimatedProps<LineProps>) => {
  const onDraw = useDrawing(
    (ctx) => {
      const { canvas, paint } = ctx;
      const { p1, p2 } = materialize(ctx, props);
      canvas.drawLine(p1.x, p1.y, p2.x, p2.y, paint);
    },
    [props]
  );
  return <skDrawing onDraw={onDraw} {...props} />;
};

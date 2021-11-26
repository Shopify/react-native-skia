import type { CustomPaintProps } from "../processors";
import { processPaint, selectPaint, useFrame } from "../processors";
import type { Vector } from "../../math/Vector";

export interface LineProps extends CustomPaintProps {
  p1: Vector;
  p2: Vector;
}

export const Line = (props: LineProps) => {
  const onDraw = useFrame(
    (ctx) => {
      const { p1, p2, ...lineProps } = props;
      const { opacity, canvas } = ctx;
      const paint = selectPaint(ctx.paint, lineProps);
      processPaint(paint, opacity, lineProps);
      canvas.drawLine(p1.x, p1.y, p2.x, p2.y, paint);
    },
    [props]
  );
  return <skDrawing onDraw={onDraw} />;
};

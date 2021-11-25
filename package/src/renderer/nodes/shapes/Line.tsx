import type { CustomPaintProps } from "../processors";
import { processPaint, selectPaint, useFrame } from "../processors";

export interface LineProps extends CustomPaintProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const Line = (props: LineProps) => {
  const onDraw = useFrame(
    (ctx) => {
      const { x1, y1, x2, y2, ...lineProps } = props;
      const { opacity, canvas } = ctx;
      const paint = selectPaint(ctx.paint, lineProps);
      processPaint(paint, opacity, lineProps);
      canvas.drawLine(x1, y1, x2, y2, paint);
    },
    [props]
  );
  return <skDrawing onDraw={onDraw} />;
};

import type { CustomPaintProps } from "./processors";
import { selectPaint, processPaint, useFrame } from "./processors";

export type FillProps = CustomPaintProps;

export const Fill = (props: FillProps) => {
  const onDraw = useFrame(
    (ctx) => {
      const paint = selectPaint(ctx.paint, props);
      processPaint(paint, ctx.opacity, props);
      ctx.canvas.drawPaint(paint);
    },
    [props]
  );
  return <skDrawing onDraw={onDraw} />;
};

import type { CustomPaintProps } from "../processors";
import { processPaint, selectPaint, useFrame } from "../processors";
import type { RectDef } from "../processors/Shapes";
import { processRect } from "../processors/Shapes";

export type OvalProps = RectDef & CustomPaintProps;

export const Oval = (rectProps: OvalProps) => {
  const onDraw = useFrame(
    (ctx) => {
      const { canvas, opacity } = ctx;
      const paint = selectPaint(ctx.paint, rectProps);
      processPaint(paint, opacity, rectProps);
      const rect = processRect(rectProps);
      canvas.drawOval(rect, paint);
    },
    [rectProps]
  );
  return <skDrawing onDraw={onDraw} />;
};

Oval.defaultProps = {
  x: 0,
  y: 0,
};

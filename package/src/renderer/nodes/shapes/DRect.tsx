import type { CustomPaintProps } from "../processors";
import { processPaint, selectPaint, useFrame } from "../processors";
import type { IRRect } from "../../../skia/RRect";

export interface DRectProps extends CustomPaintProps {
  inner: IRRect;
  outer: IRRect;
}

export const DRect = ({ inner, outer, ...rectProps }: DRectProps) => {
  const onDraw = useFrame(
    (ctx) => {
      const { canvas, opacity } = ctx;
      const paint = selectPaint(ctx.paint, rectProps);
      processPaint(paint, opacity, rectProps);
      canvas.drawDRRect(outer, inner, paint);
    },
    [inner, outer, rectProps]
  );
  return <skDrawing onDraw={onDraw} />;
};

import type { CustomPaintProps } from "../processors";
import { processPaint, selectPaint, useFrame } from "../processors";
import { Skia } from "../../../skia";

export interface OvalProps extends CustomPaintProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const Oval = ({ x, y, width, height, ...rectProps }: OvalProps) => {
  const onDraw = useFrame(
    (ctx) => {
      const { canvas, opacity } = ctx;
      const paint = selectPaint(ctx.paint, rectProps);
      processPaint(paint, opacity, rectProps);
      const rect = Skia.XYWHRect(x, y, width, height);
      canvas.drawOval(rect, paint);
    },
    [height, rectProps, width, x, y]
  );
  return <skDrawing onDraw={onDraw} />;
};

Oval.defaultProps = {
  x: 0,
  y: 0,
};

import type { CustomPaintProps } from "../processors";
import { processPaint, selectPaint, useFrame } from "../processors";
import { Skia } from "../../../skia";

export interface RectProps extends CustomPaintProps {
  x: number;
  y: number;
  width: number;
  height: number;
  rx?: number;
  ry?: number;
}

export const Rect = ({
  x,
  y,
  width,
  height,
  rx,
  ry,
  ...rectProps
}: RectProps) => {
  const onDraw = useFrame(
    (ctx) => {
      const { canvas, opacity } = ctx;
      const paint = selectPaint(ctx.paint, rectProps);
      processPaint(paint, opacity, rectProps);
      const rect = Skia.XYWHRect(x, y, width, height);
      if (rx !== undefined || ry !== undefined) {
        const corner = [(rx ?? ry) as number, (ry ?? rx) as number];
        canvas.drawRRect(Skia.RRectXY(rect, corner[0], corner[1]), paint);
      } else {
        canvas.drawRect(rect, paint);
      }
    },
    [height, rectProps, rx, ry, width, x, y]
  );
  return <skDrawing onDraw={onDraw} />;
};

Rect.defaultProps = {
  x: 0,
  y: 0,
};

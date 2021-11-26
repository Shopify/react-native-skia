import type { CustomPaintProps } from "../processors";
import type { RectDef } from "../processors/Shapes";
import { isRRect } from "../processors/Shapes";
import type { IRect } from "../../../skia/Rect";
import {
  processPaint,
  selectPaint,
  useFrame,
  processRect,
} from "../processors";

export type RectProps = RectDef & CustomPaintProps;

export const Rect = (rectProps: RectProps) => {
  const onDraw = useFrame(
    (ctx) => {
      const { canvas, opacity } = ctx;
      const paint = selectPaint(ctx.paint, rectProps);
      processPaint(paint, opacity, rectProps);
      const rect = processRect(rectProps);
      if (isRRect(rect)) {
        canvas.drawRRect(rect, paint);
      } else {
        canvas.drawRect(rect as IRect, paint);
      }
    },
    [rectProps]
  );
  return <skDrawing onDraw={onDraw} />;
};

Rect.defaultProps = {
  x: 0,
  y: 0,
};

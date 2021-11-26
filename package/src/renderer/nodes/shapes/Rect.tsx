import type { CustomPaintProps } from "../processors";
import type { RectOrRRectDef } from "../processors/Shapes";
import { isRRect } from "../processors/Shapes";
import type { IRect } from "../../../skia/Rect";
import {
  processPaint,
  selectPaint,
  useFrame,
  processRectOrRRect,
} from "../processors";

export type RectProps = RectOrRRectDef & CustomPaintProps;

export const Rect = (rectProps: RectProps) => {
  const onDraw = useFrame(
    (ctx) => {
      const { canvas, opacity } = ctx;
      const paint = selectPaint(ctx.paint, rectProps);
      processPaint(paint, opacity, rectProps);
      const rect = processRectOrRRect(rectProps);
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

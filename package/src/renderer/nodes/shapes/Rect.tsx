import type { CustomPaintProps } from "../processors";
import type { RectOrRRectDef } from "../processors/Shapes";
import { isRRect } from "../processors/Shapes";
import type { IRect } from "../../../skia/Rect";
import { useFrame, processRectOrRRect } from "../processors";
import type { AnimatedProps } from "../processors/Animations/Animations";
import { materialize } from "../processors/Animations/Animations";

export type RectProps = RectOrRRectDef & CustomPaintProps;

export const Rect = (props: AnimatedProps<RectProps>) => {
  const onDraw = useFrame(
    (ctx) => {
      const { canvas, paint } = ctx;
      const rectProps = materialize(ctx, props);
      const rect = processRectOrRRect(rectProps);
      if (isRRect(rect)) {
        canvas.drawRRect(rect, paint);
      } else {
        canvas.drawRect(rect as IRect, paint);
      }
    },
    [props]
  );
  return <skDrawing onDraw={onDraw} {...props} />;
};

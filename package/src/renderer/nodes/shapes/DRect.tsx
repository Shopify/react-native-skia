import type { CustomPaintProps } from "../processors";
import { useFrame } from "../processors";
import type { IRRect } from "../../../skia/RRect";
import type { AnimatedProps } from "../processors/Animations/Animations";
import { materialize } from "../processors/Animations/Animations";

export interface DRectProps extends CustomPaintProps {
  inner: IRRect;
  outer: IRRect;
}

export const DRect = (props: AnimatedProps<DRectProps>) => {
  const onDraw = useFrame(
    (ctx) => {
      const { canvas, paint } = ctx;
      const { inner, outer } = materialize(ctx, props);
      canvas.drawDRRect(outer, inner, paint);
    },
    [props]
  );
  return <skDrawing onDraw={onDraw} {...props} />;
};

import type { AnimatedProps } from "../processors/Animations/Animations";
import type { CustomPaintProps } from "../processors/Paint";
import { useDrawing } from "../Drawing";

export type FillProps = CustomPaintProps;

export const Fill = (props: AnimatedProps<FillProps>) => {
  const onDraw = useDrawing((ctx) => {
    const { canvas, paint } = ctx;
    canvas.drawPaint(paint);
  }, []);
  return <skDrawing onDraw={onDraw} {...props} />;
};

import type { AnimatedProps } from "../processors/Animations/Animations";
import type { CustomPaintProps } from "../processors/Paint";
import { useFrame } from "../processors/Animations/Animations";

export type FillProps = CustomPaintProps;

export const Fill = (props: AnimatedProps<FillProps>) => {
  const onDraw = useFrame((ctx) => {
    const { canvas, paint } = ctx;
    canvas.drawPaint(paint);
  }, []);
  return <skDrawing onDraw={onDraw} {...props} />;
};

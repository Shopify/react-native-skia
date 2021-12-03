import type { CustomPaintProps, AnimatedProps } from "../../processors";
import { useDrawing } from "../../nodes/Drawing";
import { vec } from "../../processors/math/Vector";
import type { CircleDef, ChildrenProps } from "../../processors/Shapes";
import { processCircle } from "../../processors/Shapes";

export type CircleProps = CircleDef & CustomPaintProps & ChildrenProps;

export const Circle = (props: AnimatedProps<CircleProps>) => {
  const onDraw = useDrawing(props, ({ canvas, paint }, def) => {
    const { c, r } = processCircle(def);
    canvas.drawCircle(c.x, c.y, r, paint);
  });
  return <skDrawing onDraw={onDraw} {...props} />;
};

Circle.defaultProps = {
  c: vec(),
};

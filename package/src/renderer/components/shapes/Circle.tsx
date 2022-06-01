import React from "react";

import type {
  CustomPaintProps,
  AnimatedProps,
  CircleDef,
} from "../../processors";
import { createDrawing } from "../../nodes/Drawing";
import { processCircle } from "../../processors";

export type CircleProps = CircleDef & CustomPaintProps;

const onDraw = createDrawing<CircleProps>(({ canvas, paint, Skia }, def) => {
  const { c, r } = processCircle(Skia, def);
  canvas.drawCircle(c.x, c.y, r, paint);
});

export const Circle = (props: AnimatedProps<CircleProps>) => {
  return <skDrawing onDraw={onDraw} {...props} />;
};

Circle.defaultProps = {
  c: { x: 0, y: 0 },
};

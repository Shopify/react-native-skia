import React from "react";

import type {
  CustomPaintProps,
  AnimatedProps,
  CircleDef,
} from "../../processors";
import { createDrawing } from "../../nodes/Drawing";
import { vec } from "../../processors/math/Vector";
import { processCircle } from "../../processors";

export type CircleProps = CircleDef & CustomPaintProps;

const onDraw = createDrawing<CircleProps>(({ canvas, paint }, def) => {
  const { c, r } = processCircle(def);
  canvas.drawCircle(c.x, c.y, r, paint);
});

export const Circle = (props: AnimatedProps<CircleProps>) => {
  return <skDrawing onDraw={onDraw} {...props} />;
};

Circle.defaultProps = {
  c: vec(0, 0),
};

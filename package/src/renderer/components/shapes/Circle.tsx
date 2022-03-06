import React from "react";

import type {
  CustomPaintProps,
  AnimatedProps,
  CircleDef,
} from "../../processors";
import { useDrawing, useBounds } from "../../nodes/Drawing";
import { vec } from "../../processors/math/Vector";
import { processCircle } from "../../processors";
import { rect } from "../../processors/Rects";

export type CircleProps = CircleDef & CustomPaintProps;

export const Circle = (props: AnimatedProps<CircleProps>) => {
  const onDraw = useDrawing(props, ({ canvas, paint }, def) => {
    const { c, r } = processCircle(def);
    canvas.drawCircle(c.x, c.y, r, paint);
  });
  const onBounds = useBounds(props, (_, def) => {
    const { c, r } = processCircle(def);
    return rect(c.x - r, c.y - r, r * 2, r * 2);
  });
  return <skDrawing onBounds={onBounds} onDraw={onDraw} {...props} />;
};

Circle.defaultProps = {
  c: vec(0, 0),
};

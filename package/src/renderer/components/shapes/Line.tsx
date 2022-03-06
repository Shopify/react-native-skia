import React from "react";

import type { CustomPaintProps, Vector, AnimatedProps } from "../../processors";
import { useDrawing, useBounds } from "../../nodes/Drawing";
import { rect } from "../../processors/Rects";

export interface LineProps extends CustomPaintProps {
  p1: Vector;
  p2: Vector;
}

export const Line = (props: AnimatedProps<LineProps>) => {
  const onDraw = useDrawing(props, ({ canvas, paint }, { p1, p2 }) => {
    canvas.drawLine(p1.x, p1.y, p2.x, p2.y, paint);
  });
  // TODO: implement bounds
  const onBounds = useBounds(props, () => rect(0, 0, 10, 10));
  return <skDrawing onDraw={onDraw} onBounds={onBounds} {...props} />;
};

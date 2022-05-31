import React from "react";

import type { CustomPaintProps, AnimatedProps } from "../../processors";
import { createDrawing } from "../../nodes/Drawing";
import type { Vector } from "../../../skia";

export interface LineProps extends CustomPaintProps {
  p1: Vector;
  p2: Vector;
}
const onDraw = createDrawing<LineProps>(({ canvas, paint }, { p1, p2 }) => {
  canvas.drawLine(p1.x, p1.y, p2.x, p2.y, paint);
});

export const Line = (props: AnimatedProps<LineProps>) => {
  return <skDrawing onDraw={onDraw} {...props} />;
};

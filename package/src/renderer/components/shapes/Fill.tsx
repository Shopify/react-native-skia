import React from "react";

import type { AnimatedProps } from "../../processors/Animations/Animations";
import type { CustomPaintProps } from "../../processors/Paint";
import { createDrawing } from "../../nodes/Drawing";

export type FillProps = CustomPaintProps;

const onDraw = createDrawing(({ canvas, paint }) => {
  canvas.drawPaint(paint);
});

export const Fill = (props: AnimatedProps<FillProps>) => {
  return <skDrawing onDraw={onDraw} {...props} />;
};

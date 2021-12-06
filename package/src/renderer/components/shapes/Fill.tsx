import React from "react";

import type { AnimatedProps } from "../../processors/Animations/Animations";
import type { CustomPaintProps } from "../../processors/Paint";
import { useDrawing } from "../../nodes/Drawing";

export type FillProps = CustomPaintProps;

export const Fill = (props: AnimatedProps<FillProps>) => {
  const onDraw = useDrawing(props, ({ canvas, paint }) => {
    canvas.drawPaint(paint);
  });
  return <skDrawing onDraw={onDraw} {...props} />;
};

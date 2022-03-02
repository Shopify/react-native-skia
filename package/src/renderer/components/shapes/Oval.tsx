import React from "react";

import type { CustomPaintProps } from "../../processors";
import type { RectDef } from "../../processors/Rects";
import { processRect } from "../../processors/Rects";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { useDrawing } from "../../nodes/Drawing";

export type OvalProps = RectDef & CustomPaintProps;

export const Oval = (props: AnimatedProps<OvalProps>) => {
  const onDraw = useDrawing(props, ({ canvas, paint }, rectProps) => {
    const rect = processRect(rectProps);
    canvas.drawOval(rect, paint);
  });
  return <skDrawing onDraw={onDraw} {...props} />;
};

Oval.defaultProps = {
  x: 0,
  y: 0,
};

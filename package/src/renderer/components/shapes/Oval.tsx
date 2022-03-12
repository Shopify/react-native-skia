import React from "react";

import type {
  CustomPaintProps,
  RectDef,
  AnimatedProps,
} from "../../processors";
import { processRect } from "../../processors";
import { useDrawing } from "../../nodes";

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

import React from "react";

import type {
  CustomPaintProps,
  RectDef,
  AnimatedProps,
} from "../../processors";
import { processRect } from "../../processors";
import { createDrawing } from "../../nodes";

export type OvalProps = RectDef & CustomPaintProps;

const onDraw = createDrawing<OvalProps>(
  ({ canvas, paint, Skia }, rectProps) => {
    const rect = processRect(Skia, rectProps);
    canvas.drawOval(rect, paint);
  }
);

export const Oval = (props: AnimatedProps<OvalProps>) => {
  return <skDrawing onDraw={onDraw} {...props} />;
};

Oval.defaultProps = {
  x: 0,
  y: 0,
};

import React from "react";

import type { CustomPaintProps, AnimatedProps } from "../../processors";
import { createDrawing } from "../../nodes";
import { processRect } from "../../../dom/nodes/datatypes";
import type { RectDef } from "../../../dom/types";

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

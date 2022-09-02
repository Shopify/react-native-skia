import React from "react";

import { processRect } from "../../../dom/nodes/datatypes";
import type { RectDef } from "../../../dom/types";
import { createDrawing } from "../../nodes/Drawing";
import type { CustomPaintProps, AnimatedProps } from "../../processors";

export type RectProps = RectDef & CustomPaintProps;

const onDraw = createDrawing<RectProps>(
  ({ canvas, paint, Skia }, rectProps) => {
    const rect = processRect(Skia, rectProps);
    canvas.drawRect(rect, paint);
  }
);

export const Rect = (props: AnimatedProps<RectProps>) => {
  return <skDrawing onDraw={onDraw} {...props} />;
};

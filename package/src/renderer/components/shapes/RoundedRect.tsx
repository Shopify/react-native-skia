import React from "react";

import { processRRect } from "../../../dom/nodes/datatypes";
import type { RRectDef } from "../../../dom/types";
import { createDrawing } from "../../nodes";
import type { CustomPaintProps, AnimatedProps } from "../../processors";

export type RoundedRectProps = RRectDef & CustomPaintProps;

const onDraw = createDrawing<RoundedRectProps>(
  ({ canvas, paint, Skia }, rectProps) => {
    const rrect = processRRect(Skia, rectProps);
    canvas.drawRRect(rrect, paint);
  }
);
export const RoundedRect = (props: AnimatedProps<RoundedRectProps>) => {
  return <skDrawing onDraw={onDraw} {...props} />;
};

RoundedRect.defaultProps = {
  r: 0,
};

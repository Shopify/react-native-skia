import React from "react";

import { createDrawing } from "../../nodes";
import type {
  CustomPaintProps,
  RRectDef,
  AnimatedProps,
} from "../../processors";
import { processRRect } from "../../processors";

export type RoundedRectProps = RRectDef & CustomPaintProps;

const onDraw = createDrawing<RoundedRectProps>(
  ({ canvas, paint }, rectProps) => {
    const rrect = processRRect(rectProps);
    canvas.drawRRect(rrect, paint);
  }
);
export const RoundedRect = (props: AnimatedProps<RoundedRectProps>) => {
  return <skDrawing onDraw={onDraw} {...props} />;
};

RoundedRect.defaultProps = {
  r: 0,
};

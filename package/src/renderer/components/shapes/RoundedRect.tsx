import React from "react";

import { useDrawing } from "../../nodes";
import type {
  CustomPaintProps,
  RRectDef,
  AnimatedProps,
} from "../../processors";
import { processRRect } from "../../processors";

export type RoundedRectProps = RRectDef & CustomPaintProps;

export const RoundedRect = (props: AnimatedProps<RoundedRectProps>) => {
  const onDraw = useDrawing(props, ({ canvas, paint }, rectProps) => {
    const rrect = processRRect(rectProps);
    canvas.drawRRect(rrect, paint);
  });
  return <skDrawing onDraw={onDraw} {...props} />;
};

RoundedRect.defaultProps = {
  rx: 0,
};

import React from "react";

import { useDrawing } from "../../nodes/Drawing";
import type {
  CustomPaintProps,
  RectDef,
  AnimatedProps,
} from "../../processors";
import { processRect } from "../../processors";

export type RectProps = RectDef & CustomPaintProps;

export const Rect = (props: AnimatedProps<RectProps>) => {
  const onDraw = useDrawing(props, ({ canvas, paint }, rectProps) => {
    const rect = processRect(rectProps);
    canvas.drawRect(rect, paint);
  });
  return <skDrawing onDraw={onDraw} {...props} />;
};

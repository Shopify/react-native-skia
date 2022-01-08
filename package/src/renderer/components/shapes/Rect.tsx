import React from "react";

import type { CustomPaintProps } from "../../processors";
import type { RectDef, RRectDef } from "../../processors/Shapes";
import { processRect, processRRect } from "../../processors/Shapes";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { useDrawing } from "../../nodes/Drawing";

export type RectProps = RectDef & CustomPaintProps;

export const Rect = (props: AnimatedProps<RectProps>) => {
  const onDraw = useDrawing(props, ({ canvas, paint }, rectProps) => {
    const rect = processRect(rectProps);
    canvas.drawRect(rect, paint);
  });
  return <skDrawing onDraw={onDraw} {...props} />;
};

export type RRectProps = RRectDef & CustomPaintProps;

export const RRect = (props: AnimatedProps<RRectProps>) => {
  const onDraw = useDrawing(props, ({ canvas, paint }, rectProps) => {
    const rrect = processRRect(rectProps);
    canvas.drawRRect(rrect, paint);
  });
  return <skDrawing onDraw={onDraw} {...props} />;
};

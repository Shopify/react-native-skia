import React from "react";

import { useDrawing } from "../../nodes/Drawing";
import type { CustomPaintProps } from "../../processors";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import type { RRectDef } from "../../processors/Shapes";
import { processRRect } from "../../processors/Shapes";

export type RoundRectProps = RRectDef & CustomPaintProps;

export const RoundRect = (props: AnimatedProps<RoundRectProps>) => {
  const onDraw = useDrawing(props, ({ canvas, paint }, rectProps) => {
    const rrect = processRRect(rectProps);
    canvas.drawRRect(rrect, paint);
  });
  return <skDrawing onDraw={onDraw} {...props} />;
};

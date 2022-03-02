import React from "react";

import { useDrawing } from "../../nodes/Drawing";
import type { CustomPaintProps } from "../../processors";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import type { RectDef } from "../../processors/Rects";
import { processRect } from "../../processors/Rects";

export type RectProps = RectDef & CustomPaintProps;

export const Rect = (props: AnimatedProps<RectProps>) => {
  const onDraw = useDrawing(props, ({ canvas, paint }, rectProps) => {
    const rect = processRect(rectProps);
    canvas.drawRect(rect, paint);
  });
  return <skDrawing onDraw={onDraw} {...props} />;
};

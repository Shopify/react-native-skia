import React from "react";

import type { AnimatedProps } from "../../processors/Animations/Animations";
import type { CustomPaintProps } from "../../processors/Paint";
import { useDrawing, useBounds } from "../../nodes/Drawing";
import { rect } from "../../processors/Rects";

export type FillProps = CustomPaintProps;

export const Fill = (props: AnimatedProps<FillProps>) => {
  const onDraw = useDrawing(props, ({ canvas, paint }) => {
    canvas.drawPaint(paint);
  });
  const onBounds = useBounds(props, (ctx) => rect(0, 0, ctx.width, ctx.height));
  return <skDrawing onDraw={onDraw} onBounds={onBounds} {...props} />;
};

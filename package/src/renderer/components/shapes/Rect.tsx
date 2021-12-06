import React from "react";

import type { CustomPaintProps } from "../../processors";
import type { RectOrRRectDef } from "../../processors/Shapes";
import { isRRect } from "../../processors/Shapes";
import type { IRect } from "../../../skia/Rect";
import { processRectOrRRect } from "../../processors";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { useDrawing } from "../../nodes/Drawing";

export type RectProps = RectOrRRectDef & CustomPaintProps;

export const Rect = (props: AnimatedProps<RectProps>) => {
  const onDraw = useDrawing(props, ({ canvas, paint }, rectProps) => {
    const rect = processRectOrRRect(rectProps);
    if (isRRect(rect)) {
      canvas.drawRRect(rect, paint);
    } else {
      canvas.drawRect(rect as IRect, paint);
    }
  });
  return <skDrawing onDraw={onDraw} {...props} />;
};

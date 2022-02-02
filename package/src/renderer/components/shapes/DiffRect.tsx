import React from "react";

import type { CustomPaintProps } from "../../processors";
import type { IRRect } from "../../../skia/RRect";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { useDrawing } from "../../nodes/Drawing";

export interface DiffRectProps extends CustomPaintProps {
  inner: IRRect;
  outer: IRRect;
}

export const DiffRect = (props: AnimatedProps<DiffRectProps>) => {
  const onDraw = useDrawing(props, ({ canvas, paint }, { inner, outer }) => {
    canvas.drawDRRect(outer, inner, paint);
  });
  return <skDrawing onDraw={onDraw} {...props} />;
};

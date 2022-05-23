import React from "react";

import type { CustomPaintProps } from "../../processors";
import type { SkRRect } from "../../../skia";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { createDrawing } from "../../nodes/Drawing";

export interface DiffRectProps extends CustomPaintProps {
  inner: SkRRect;
  outer: SkRRect;
}

const onDraw = createDrawing<DiffRectProps>(
  ({ canvas, paint }, { inner, outer }) => {
    canvas.drawDRRect(outer, inner, paint);
  }
);

export const DiffRect = (props: AnimatedProps<DiffRectProps>) => {
  return <skDrawing onDraw={onDraw} {...props} />;
};

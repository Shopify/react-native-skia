import React from "react";

import type { CustomPaintProps } from "../../processors";
import type { SkRRect } from "../../../skia/RRect";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { useDrawing, useBounds } from "../../nodes/Drawing";

export interface DiffRectProps extends CustomPaintProps {
  inner: SkRRect;
  outer: SkRRect;
}

export const DiffRect = (props: AnimatedProps<DiffRectProps>) => {
  const onDraw = useDrawing(props, ({ canvas, paint }, { inner, outer }) => {
    canvas.drawDRRect(outer, inner, paint);
  });
  const onBounds = useBounds(props, (_, { outer }) => outer.rect);
  return <skDrawing onDraw={onDraw} onBounds={onBounds} {...props} />;
};

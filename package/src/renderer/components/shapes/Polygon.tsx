import React from "react";

import type { SkPoint } from "../../../skia";
import { createDrawing } from "../../nodes";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import type { CustomPaintProps } from "../../processors/Paint";

interface PolygonProps extends CustomPaintProps {
  points: SkPoint[];
}

const onDraw = createDrawing<PolygonProps>(
  ({ canvas, paint, Skia }, { points }) => {
    const path = points.reduce((current, point) => {
      current.lineTo(point.x, point.y);
      return current;
    }, Skia.Path.Make());
    canvas.drawPath(path, paint);
  }
);

export const Polygon = (props: AnimatedProps<PolygonProps>) => {
  return <skDrawing onDraw={onDraw} {...props} />;
};

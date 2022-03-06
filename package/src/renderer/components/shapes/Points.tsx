import React from "react";

import type { CustomPaintProps, SkEnum } from "../../processors";
import type { SkPoint } from "../../../skia";
import { PointMode } from "../../../skia";
import { enumKey } from "../../processors/Paint";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { useDrawing, useBounds } from "../../nodes/Drawing";
import { rect } from "../../processors/Rects";

export interface PointsProps extends CustomPaintProps {
  points: SkPoint[];
  mode: SkEnum<typeof PointMode>;
}

export const Points = (props: AnimatedProps<PointsProps>) => {
  const onDraw = useDrawing(props, ({ canvas, paint }, { points, mode }) => {
    const pointMode = PointMode[enumKey(mode)];
    canvas.drawPoints(pointMode, points, paint);
  });
  const onBounds = useBounds(props, () => {
    // TODO: implement
    return rect(0, 0, 10, 10);
  });
  return <skDrawing onDraw={onDraw} onBounds={onBounds} {...props} />;
};

Points.defaultProps = {
  mode: "points",
};

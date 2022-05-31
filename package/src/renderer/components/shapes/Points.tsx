import React from "react";

import type { CustomPaintProps, SkEnum } from "../../processors";
import type { SkPoint } from "../../../skia/types";
import { PointMode } from "../../../skia/types";
import { enumKey } from "../../processors/Paint";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { createDrawing } from "../../nodes/Drawing";

export interface PointsProps extends CustomPaintProps {
  points: SkPoint[];
  mode: SkEnum<typeof PointMode>;
}

const onDraw = createDrawing<PointsProps>(
  ({ canvas, paint }, { points, mode }) => {
    const pointMode = PointMode[enumKey(mode)];
    canvas.drawPoints(pointMode, points, paint);
  }
);

export const Points = (props: AnimatedProps<PointsProps>) => {
  return <skDrawing onDraw={onDraw} {...props} />;
};

Points.defaultProps = {
  mode: "points",
};

import React from "react";

import type { CustomPaintProps } from "../../processors";
import type { SkPoint } from "../../../skia/types";
import { PointMode } from "../../../skia/types";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { createDrawing } from "../../nodes/Drawing";
import type { SkEnum } from "../../../dom/types";
import { enumKey } from "../../../dom/nodes/datatypes";

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

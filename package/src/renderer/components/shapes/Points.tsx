import React from "react";

import type { CustomPaintProps, SkEnum } from "../../processors";
import type { IPoint } from "../../../skia";
import { PointMode } from "../../../skia";
import { enumKey } from "../../processors/Paint";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { useDrawing } from "../../nodes/Drawing";

export interface PointsProps extends CustomPaintProps {
  points: IPoint[];
  mode: SkEnum<typeof PointMode>;
}

export const Points = (props: AnimatedProps<PointsProps>) => {
  const onDraw = useDrawing(props, ({ canvas, paint }, { points, mode }) => {
    const pointMode = PointMode[enumKey(mode)];
    canvas.drawPoints(pointMode, points, paint);
  });
  return <skDrawing onDraw={onDraw} {...props} />;
};

Points.defaultProps = {
  mode: "points",
};

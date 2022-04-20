import React from "react";

import type {
  CustomPaintProps,
  AnimatedProps,
  PathDef,
} from "../../processors";
import { createDrawing } from "../../nodes";
import { processPath } from "../../processors";

interface StrokeOpts {
  width?: number;
  strokeMiterlimit?: number;
  precision?: number;
}

export interface PathProps extends CustomPaintProps {
  path: PathDef;
  start: number;
  end: number;
  stroke?: StrokeOpts;
}

const onDraw = createDrawing<PathProps>(
  ({ canvas, paint }, { start, end, stroke, ...pathProps }) => {
    const hasStartOffset = start !== 0;
    const hasEndOffset = end !== 1;
    const hasStrokeOptions = stroke !== undefined;
    const willMutatePath = hasStartOffset || hasEndOffset || hasStrokeOptions;
    const pristinePath = processPath(pathProps.path);
    const path = willMutatePath ? pristinePath.copy() : pristinePath;
    if (hasStrokeOptions) {
      path.stroke(stroke);
    }
    if (hasStartOffset || hasEndOffset) {
      path.trim(start, end, false);
    }
    canvas.drawPath(path, paint);
  }
);

export const Path = (props: AnimatedProps<PathProps>) => {
  return <skDrawing onDraw={onDraw} {...props} />;
};

Path.defaultProps = {
  start: 0,
  end: 1,
};

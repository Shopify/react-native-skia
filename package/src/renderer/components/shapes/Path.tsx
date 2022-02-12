import React from "react";

import type {
  CustomPaintProps,
  AnimatedProps,
  PathDef,
} from "../../processors";
import { useDrawing } from "../../nodes";
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

export const Path = (props: AnimatedProps<PathProps>) => {
  const onDraw = useDrawing(
    props,
    ({ canvas, paint }, { start, end, stroke, ...pathProps }) => {
      const path = processPath(pathProps.path).copy();
      if (stroke) {
        path.stroke(stroke);
      }
      if (start !== 0 || end !== 1) {
        path.trim(start, end, false);
      }
      canvas.drawPath(path, paint);
    }
  );
  return <skDrawing onDraw={onDraw} {...props} />;
};

Path.defaultProps = {
  start: 0,
  end: 1,
};

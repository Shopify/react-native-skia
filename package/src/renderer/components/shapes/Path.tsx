import React from "react";

import type { CustomPaintProps } from "../../processors";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { useDrawing } from "../../nodes/Drawing";
import type { PathDef } from "../../processors/Paths";
import { processPath } from "../../processors/Paths";

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
    ({ canvas, paint }, { start, end, stroke, path: pathDef }) => {
      const path = processPath(pathDef);
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

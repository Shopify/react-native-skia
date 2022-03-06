import React from "react";

import type {
  CustomPaintProps,
  AnimatedProps,
  PathDef,
} from "../../processors";
import { useDrawing } from "../../nodes";
import { processPath } from "../../processors";
import { useBounds } from "../../nodes/Drawing";

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
      const hasStartOffset = start !== 0;
      const hasEndOffset = start !== 1;
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
  const onBounds = useBounds(
    props,
    (_, { start, end, stroke, ...pathProps }) => {
      // TODO: optimize
      const hasStartOffset = start !== 0;
      const hasEndOffset = start !== 1;
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
      return path.getBounds();
    }
  );
  return <skDrawing onDraw={onDraw} onBounds={onBounds} {...props} />;
};

Path.defaultProps = {
  start: 0,
  end: 1,
};

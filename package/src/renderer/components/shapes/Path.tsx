import React from "react";

import type {
  CustomPaintProps,
  AnimatedProps,
  PathDef,
  SkEnum,
} from "../../processors";
import { createDrawing } from "../../nodes";
import { processPath, enumKey } from "../../processors";
import { FillType } from "../../../skia/types";
import type { SkPath } from "../../../skia/types";
import { useComputedProps } from "../../useProps";
import { useCanvas } from "../../useCanvas";

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
  fillType?: SkEnum<typeof FillType>;
}

export const Path = (props: AnimatedProps<PathProps>) => {
  const { Skia } = useCanvas();
  const pathProp = useComputedProps(
    ({ start, end, stroke, fillType, ...pathProps }) => {
      const hasStartOffset = start !== 0;
      const hasEndOffset = end !== 1;
      const hasStrokeOptions = stroke !== undefined;
      const hasFillType = !!fillType;
      const willMutatePath =
        hasStartOffset || hasEndOffset || hasStrokeOptions || hasFillType;
      const pristinePath = processPath(Skia, pathProps.path);
      const path = willMutatePath ? pristinePath.copy() : pristinePath;
      if (hasFillType) {
        path.setFillType(FillType[enumKey(fillType)]);
      }
      if (hasStrokeOptions) {
        path.stroke(stroke);
      }
      if (hasStartOffset || hasEndOffset) {
        path.trim(start, end, false);
      }
      return path;
    },
    props
  );
  return <PathNode path={pathProp} />;
};

Path.defaultProps = {
  start: 0,
  end: 1,
};

interface PathNodeProps {
  path: SkPath;
}

const onDraw = createDrawing<PathNodeProps>(({ canvas, paint }, { path }) => {
  canvas.drawPath(path, paint);
});

const PathNode = (props: AnimatedProps<PathNodeProps>) => {
  return <skDrawing onDraw={onDraw} {...props} />;
};

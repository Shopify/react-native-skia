import React from "react";

import type { CustomPaintProps } from "../../processors";
import type { IPath } from "../../../skia";
import { Skia } from "../../../skia";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { useDrawing } from "../../nodes/Drawing";
import type { ChildrenProps } from "../../processors/Shapes";

interface StrokeOpts {
  width?: number;
  strokeMiterlimit?: number;
  precision?: number;
}

export interface PathProps extends CustomPaintProps, StrokeOpts, ChildrenProps {
  path: IPath | string;
  start: number;
  end: number;
}

export const Path = (props: AnimatedProps<PathProps>) => {
  const onDraw = useDrawing(
    props,
    ({ canvas, paint }, { start, end, ...pathProps }) => {
      const path =
        typeof pathProps.path === "string"
          ? Skia.Path.MakeFromSVGString(pathProps.path)
          : pathProps.path.copy();
      if (path === null) {
        throw new Error("Invalid path:  " + pathProps.path);
      }
      // path.stroke(pathProps);
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

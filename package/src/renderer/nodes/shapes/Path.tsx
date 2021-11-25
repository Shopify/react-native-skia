import type { CustomPaintProps } from "../processors";
import { selectPaint, processPaint, useFrame } from "../processors";
import type { IPath } from "../../../skia";
import { Skia } from "../../../skia";

interface StrokeOpts {
  width?: number;
  strokeMiterlimit?: number;
  precision?: number;
}

export interface PathProps extends CustomPaintProps, StrokeOpts {
  path: IPath | string;
  // TODO: Rename to start, end to be more symmetric to Skia and reflect the semantic better
  progress: number;
  offset: number;
}

export const Path = ({ offset, progress, ...pathProps }: PathProps) => {
  const onDraw = useFrame(
    (ctx) => {
      const { opacity, canvas } = ctx;
      const paint = selectPaint(ctx.paint, pathProps);
      processPaint(paint, opacity, pathProps);
      const path =
        typeof pathProps.path === "string"
          ? Skia.Path.MakeFromSVGString(pathProps.path)
          : pathProps.path.copy();
      if (path === null) {
        throw new Error("Invalid path:  " + pathProps.path);
      }
      // path.stroke(pathProps);
      if (offset !== 0 || progress !== 1) {
        path.trim(offset, progress, false);
      }
      canvas.drawPath(path, paint);
    },
    [offset, pathProps, progress]
  );
  return <skDrawing onDraw={onDraw} />;
};

Path.defaultProps = {
  offset: 0,
  progress: 1,
};

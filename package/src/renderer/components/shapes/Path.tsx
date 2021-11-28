import type { CustomPaintProps } from "../../processors";
import type { IPath } from "../../../skia";
import { Skia } from "../../../skia";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { materialize } from "../../processors/Animations/Animations";
import { useDrawing } from "../../nodes/Drawing";

interface StrokeOpts {
  width?: number;
  strokeMiterlimit?: number;
  precision?: number;
}

export interface PathProps extends CustomPaintProps, StrokeOpts {
  path: IPath | string;
  start: number;
  end: number;
}

export const Path = (props: AnimatedProps<PathProps>) => {
  const onDraw = useDrawing(
    (ctx) => {
      const { start, end, ...pathProps } = materialize(ctx, props);
      const { canvas, paint } = ctx;
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
    },
    [props]
  );
  return <skDrawing onDraw={onDraw} {...props} />;
};

Path.defaultProps = {
  start: 0,
  end: 1,
};

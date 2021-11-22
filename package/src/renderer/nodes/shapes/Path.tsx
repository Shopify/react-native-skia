import type { SkNode } from "../../Host";
import { NodeType } from "../../Host";
import type { CustomPaintProps } from "../processors";
import { selectPaint, processPaint } from "../processors";
import { Skia } from "../../../skia";
import type { IPath as IPath } from "../../../skia";
import type { DrawingContext } from "../../DrawingContext";

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

export const Path = (props: PathProps) => {
  return <skPath {...props} />;
};

Path.defaultProps = {
  offset: 0,
  progress: 1,
};

export const PathNode = (props: PathProps): SkNode<NodeType.Path> => ({
  type: NodeType.Path,
  props,
  draw: (ctx: DrawingContext, { offset, progress, ...pathProps }) => {
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
  children: [],
});

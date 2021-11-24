import type { ReactNode, RefObject } from "react";

import { NodeType, processChildren } from "../Host";
import type { SkNode } from "../Host";
import type { IRRect, IPath, IPaint } from "../../skia";
import { ClipOp, Skia } from "../../skia";

import { processTransform, selectPaint, processPaint } from "./processors";
import { materialize } from "./processors/Animations/Animations";
import type {
  CustomPaintProps,
  TransformProps,
  AnimatedProps,
} from "./processors";

export interface GroupProps extends CustomPaintProps, TransformProps {
  children: ReactNode | ReactNode[];
  clipRect?: IRRect;
  clipPath?: IPath | string;
  clipOp?: "difference" | "intersect";
  rasterize?: { paint: RefObject<IPaint> };
}

export const Group = (props: AnimatedProps<GroupProps>) => {
  return <skGroup {...props} />;
};

export const GroupNode = (
  props: AnimatedProps<GroupProps>
): SkNode<NodeType.Group> => ({
  type: NodeType.Group,
  props,
  draw: (ctx, newProps, children) => {
    const { clipRect, rasterize, clipPath, clipOp, ...groupProps } =
      materialize(ctx, newProps);
    const { canvas, opacity } = ctx;
    const paint = selectPaint(ctx.paint, groupProps);
    processPaint(paint, opacity, groupProps);
    if (rasterize) {
      canvas.saveLayer(rasterize.paint.current ?? undefined);
    } else {
      canvas.save();
    }
    const op = clipOp === "difference" ? ClipOp.Difference : ClipOp.Intersect;
    if (clipRect) {
      canvas.clipRRect(clipRect, op, true);
    }
    if (clipPath) {
      const path =
        typeof clipPath === "string"
          ? Skia.Path.MakeFromSVGString(clipPath)
          : clipPath;
      if (!path) {
        throw new Error("Invalid clipPath: " + clipPath);
      }
      canvas.clipPath(path, op, true);
    }
    processTransform(ctx, groupProps);
    processChildren(
      { ...ctx, paint, opacity: groupProps.opacity ?? opacity },
      children
    );
    canvas.restore();
  },
  children: [],
});

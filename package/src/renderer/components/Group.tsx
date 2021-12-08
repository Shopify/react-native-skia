import React from "react";
import type { ReactNode, RefObject } from "react";

import { processChildren } from "../Host";
import type { IPath, IPaint } from "../../skia";
import { ClipOp, Skia } from "../../skia";
import { processTransform, selectPaint, processPaint } from "../processors";
import type {
  CustomPaintProps,
  TransformProps,
  AnimatedProps,
} from "../processors";
import { useDrawing } from "../nodes/Drawing";
import type { RectOrRRectDef } from "../processors/Shapes";
import { processRectOrRRect, isRRect, rrect } from "../processors/Shapes";

export interface GroupProps extends CustomPaintProps, TransformProps {
  children: ReactNode | ReactNode[];
  clipRect?: RectOrRRectDef;
  clipPath?: IPath | string;
  invertClip?: boolean;
  rasterize?: RefObject<IPaint>;
}

export const Group = (props: AnimatedProps<GroupProps>) => {
  const onDraw = useDrawing(
    props,
    (
      ctx,
      { clipRect, rasterize, clipPath, invertClip, ...groupProps },
      children
    ) => {
      const { canvas, opacity } = ctx;
      const paint = selectPaint(ctx.paint, groupProps);
      processPaint(paint, opacity, groupProps);
      if (rasterize) {
        canvas.saveLayerPaint(rasterize.current ?? undefined);
      } else {
        canvas.save();
      }
      const op = invertClip ? ClipOp.Difference : ClipOp.Intersect;
      if (clipRect) {
        const rect = processRectOrRRect(clipRect);
        canvas.clipRRect(isRRect(rect) ? rect : rrect(rect, 0, 0), op, true);
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
        {
          ...ctx,
          paint,
          opacity: groupProps.opacity ? groupProps.opacity * opacity : opacity,
        },
        children
      );
      canvas.restore();
    }
  );
  return <skDrawing onDraw={onDraw} {...props} skipProcessing />;
};

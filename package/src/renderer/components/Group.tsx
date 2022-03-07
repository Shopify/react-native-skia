import React from "react";
import type { RefObject } from "react";

import type { SkPaint } from "../../skia";
import { ClipOp } from "../../skia";
import {
  processTransform,
  selectPaint,
  processPaint,
  processClip,
} from "../processors";
import type {
  CustomPaintProps,
  TransformProps,
  AnimatedProps,
  ClipDef,
} from "../processors";
import { createDrawing } from "../nodes/Drawing";

export interface GroupProps extends CustomPaintProps, TransformProps {
  clip?: ClipDef;
  invertClip?: boolean;
  rasterize?: RefObject<SkPaint>;
}

const onDraw = createDrawing<GroupProps>(
  (ctx, { rasterize, clip, invertClip, ...groupProps }, node) => {
    const { canvas, opacity } = ctx;
    const paint = selectPaint(ctx.paint, groupProps);
    processPaint(paint, opacity, groupProps);
    if (rasterize) {
      canvas.saveLayer(rasterize.current ?? undefined);
    } else {
      canvas.save();
    }
    processTransform(ctx, groupProps);
    if (clip) {
      const op = invertClip ? ClipOp.Difference : ClipOp.Intersect;
      processClip(canvas, clip, op);
    }
    node.visit({
      ...ctx,
      paint,
      opacity: groupProps.opacity ? groupProps.opacity * opacity : opacity,
    });
    canvas.restore();
  }
);

export const Group = (props: AnimatedProps<GroupProps>) => {
  return <skDrawing onDraw={onDraw} {...props} skipProcessing />;
};

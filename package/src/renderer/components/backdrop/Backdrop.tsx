import React from "react";
import type { ReactNode } from "react";

import { processColor, isImageFilter, ClipOp } from "../../../skia";
import { processClip } from "../../processors";
import type { AnimatedProps, ClipDef } from "../../processors";
import type { Color } from "../../../skia";
import { useDrawing } from "../../nodes";
import { processChildren } from "../../Host";

export interface BackdropProps {
  color?: Color;
  clip: ClipDef;
  children: ReactNode | ReactNode[];
}

export const Backdrop = (props: AnimatedProps<BackdropProps>) => {
  const onDraw = useDrawing(props, (ctx, { color, clip }, children) => {
    const filter = processChildren(ctx, children);
    const [imgf] = filter.filter(isImageFilter);
    if (!imgf) {
      throw new Error("No image filter provided to the background");
    }
    const { canvas, opacity } = ctx;
    canvas.save();
    processClip(canvas, clip, ClipOp.Intersect);
    canvas.saveLayer(undefined, null, imgf);
    if (color) {
      canvas.drawColor(processColor(color, opacity));
    }
    canvas.restore();
    canvas.restore();
  });
  return <skDrawing onDraw={onDraw} {...props} skipProcessing />;
};

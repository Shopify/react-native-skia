import React from "react";
import type { ReactNode } from "react";

import { processColor, isImageFilter, ClipOp } from "../../../skia";
import { processClip } from "../../processors";
import type { AnimatedProps, ClipDef } from "../../processors";
import type { Color } from "../../../skia";
import { useDrawing } from "../../nodes";
import { processChildren } from "../../Host";
import { isColorFilter } from "../../../skia/ColorFilter/ColorFilter";
import { Skia } from "../../../skia/Skia";

export interface BackdropProps {
  color?: Color;
  clip: ClipDef;
  children: ReactNode | ReactNode[];
}

export const Backdrop = (props: AnimatedProps<BackdropProps>) => {
  const onDraw = useDrawing(props, (ctx, { color, clip }, children) => {
    const filters = processChildren(ctx, children);
    const [imgf] = filters.filter(isImageFilter);
    const [rawcf] = filters.filter(isColorFilter);
    const filter = rawcf
      ? Skia.ImageFilter.MakeColorFilter(rawcf, imgf ?? null)
      : imgf;

    if (!filter) {
      throw new Error("No image filter provided to the background");
    }
    const { canvas, opacity } = ctx;
    canvas.save();
    processClip(canvas, clip, ClipOp.Intersect);
    canvas.saveLayer(undefined, null, filter);
    if (color) {
      canvas.drawColor(processColor(color, opacity));
    }
    canvas.restore();
    canvas.restore();
  });
  return <skDrawing onDraw={onDraw} {...props} skipProcessing />;
};

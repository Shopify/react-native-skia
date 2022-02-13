import React, { useRef } from "react";
import type { ReactNode } from "react";

import { processColor, ClipOp } from "../../../skia";
import { processClip } from "../../processors";
import type { AnimatedProps, ClipDef } from "../../processors";
import type { Color } from "../../../skia";
import { useDrawing } from "../../nodes";
import { processChildren } from "../../Host";
import { getInput } from "../imageFilters/getInput";
import type { IImageFilter } from "../../../skia/ImageFilter/ImageFilter";

export interface BackdropFilterProps {
  color?: Color;
  clip: ClipDef;
  children: ReactNode | ReactNode[];
}

export const BackdropFilter = (props: AnimatedProps<BackdropFilterProps>) => {
  const onDraw = useDrawing(props, (ctx, { color, clip }, children) => {
    const toFilter = processChildren(ctx, children);
    const filter = getInput(toFilter);
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

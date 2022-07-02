import React from "react";

import type { AnimatedProps } from "../../processors";
import type { RectProps } from "../shapes";
import { processRect } from "../../processors";
import { createDrawing } from "../../nodes/Drawing";

export type SkottieProps = RectProps & {
  anim: string;
  // value from 0 - 1 (or negative as well?)
  progress: number;
};

const onDraw = createDrawing<SkottieProps>(
  ({ canvas, paint, Skia }, { anim, progress, ...rectProps }) => {
    const rect = processRect(Skia, rectProps);
    canvas.drawAnimation(anim, rect, progress);
  }
);
export const SkottieAnimation = (props: AnimatedProps<SkottieProps>) => {
  return <skDrawing onDraw={onDraw} {...props} />;
};

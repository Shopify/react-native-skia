import React from "react";

import type { AnimatedProps } from "../../processors";
import type { RectProps } from "../shapes";
import { processRect } from "../../processors";
import { createDrawing } from "../../nodes/Drawing";

export type SkottieProps = RectProps & {
  anim: string;
};

const onDraw = createDrawing<SkottieProps>(
  ({ canvas, paint, Skia }, { anim, ...rectProps }) => {
    const rect = processRect(Skia, rectProps);
    canvas.drawAnimation(anim, rect);
  }
);
export const SkottieAnimation = (props: AnimatedProps<SkottieProps>) => {
  return <skDrawing onDraw={onDraw} {...props} />;
};

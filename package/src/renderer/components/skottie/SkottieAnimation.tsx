import React from "react";

import type { AnimatedProps } from "../../processors";
import type { RectProps } from "../shapes";
import { processRect } from "../../processors";
import { createDrawing } from "../../nodes/Drawing";
import type { SkSkottieAnimation } from "../../../skia/types/SkottieAnimation";

export type SkottieProps = RectProps & {
  anim: SkSkottieAnimation;
  // value from 0 - 1 (or negative as well?)
  progress: number;
};

const onDraw = createDrawing<SkottieProps>(
  ({ canvas, Skia }, { anim, progress, ...rectProps }) => {
    const rect = processRect(Skia, rectProps);
    anim.seek(progress);
    anim.render(canvas, rect);
  }
);
export const SkottieAnimation = (props: AnimatedProps<SkottieProps>) => {
  return <skDrawing onDraw={onDraw} {...props} />;
};

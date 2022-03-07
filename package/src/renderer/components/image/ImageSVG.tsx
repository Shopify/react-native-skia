import React from "react";

import type { SkSVG } from "../../../skia";
import { createDrawing } from "../../nodes";
import type { AnimatedProps, RectDef } from "../../processors";
import { processRect } from "../../processors";

export type ImageSVGProps = RectDef & {
  svg: SkSVG;
};

const onDraw = createDrawing<ImageSVGProps>(
  ({ canvas }, { svg, ...rectProps }) => {
    const { x, y, width, height } = processRect(rectProps);
    canvas.save();
    canvas.translate(x, y);
    canvas.drawSvg(svg, width, height);
    canvas.restore();
  }
);

export const ImageSVG = (props: AnimatedProps<ImageSVGProps>) => {
  return <skDrawing onDraw={onDraw} {...props} />;
};

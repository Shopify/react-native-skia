import React from "react";

import { processRect } from "../../../dom/nodes/datatypes";
import type { RectDef } from "../../../dom/types";
import type { SkSVG } from "../../../skia/types";
import { createDrawing } from "../../nodes";
import type { AnimatedProps } from "../../processors";

export type ImageSVGProps = RectDef & {
  svg: SkSVG;
};

const onDraw = createDrawing<ImageSVGProps>(
  ({ canvas, Skia }, { svg, ...rectProps }) => {
    const { x, y, width, height } = processRect(Skia, rectProps);
    canvas.save();
    canvas.translate(x, y);
    canvas.drawSvg(svg, width, height);
    canvas.restore();
  }
);

export const ImageSVG = (props: AnimatedProps<ImageSVGProps>) => {
  return <skDrawing onDraw={onDraw} {...props} />;
};

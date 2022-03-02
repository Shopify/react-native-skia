import React from "react";

import type { SVG } from "../../../skia";
import { useDrawing } from "../../nodes";
import type { AnimatedProps, RectDef } from "../../processors";
import { processRect } from "../../processors";

export type ImageSVGProps = RectDef & {
  svg: SVG;
};

export const ImageSVG = (props: AnimatedProps<ImageSVGProps>) => {
  const onDraw = useDrawing(props, ({ canvas }, { svg, ...rectProps }) => {
    const { x, y, width, height } = processRect(rectProps);
    canvas.save();
    canvas.translate(x, y);
    canvas.drawSvg(svg, width, height);
    canvas.restore();
  });
  return <skDrawing onDraw={onDraw} {...props} />;
};

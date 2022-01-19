import React from "react";

import type { SVG } from "../../../skia";
import { useDrawing } from "../../nodes/Drawing";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import type { RectDef } from "../../processors/Shapes";
import { processRect } from "../../processors/Shapes";

export type ImageSVGProps = RectDef & {
  source: SVG;
};

export const ImageSVG = (props: AnimatedProps<ImageSVGProps>) => {
  const onDraw = useDrawing(props, ({ canvas }, { source, ...rectProps }) => {
    const { x, y, width, height } = processRect(rectProps);
    canvas.save();
    canvas.translate(x, y);
    canvas.drawSvg(source, width, height);
    canvas.restore();
  });
  return <skDrawing onDraw={onDraw} {...props} />;
};

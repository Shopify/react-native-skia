import React from "react";

import type { SVG } from "../../../skia";
import { useDrawing } from "../../nodes/Drawing";
import type { AnimatedProps } from "../../processors/Animations/Animations";

export type ImageSVGProps = {
  source: SVG;
  width?: number;
  height?: number;
};

export const ImageSVG = (props: AnimatedProps<ImageSVGProps>) => {
  const onDraw = useDrawing(props, ({ canvas }, { source, width, height }) => {
    canvas.drawSvg(source, width, height);
  });
  return <skDrawing onDraw={onDraw} {...props} />;
};

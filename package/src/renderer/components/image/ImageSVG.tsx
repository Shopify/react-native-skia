import React from "react";

import type { SkSVG } from "../../../skia";
import { useDrawing } from "../../nodes";
import type { AnimatedProps, RectDef } from "../../processors";
import { processRect } from "../../processors";
import { useBounds } from "../../nodes/Drawing";

export type ImageSVGProps = RectDef & {
  svg: SkSVG;
};

export const ImageSVG = (props: AnimatedProps<ImageSVGProps>) => {
  const onDraw = useDrawing(props, ({ canvas }, { svg, ...rectProps }) => {
    const { x, y, width, height } = processRect(rectProps);
    canvas.save();
    canvas.translate(x, y);
    canvas.drawSvg(svg, width, height);
    canvas.restore();
  });
  const onBounds = useBounds(props, (_, { svg, ...rectProps }) =>
    processRect(rectProps)
  );
  return <skDrawing onDraw={onDraw} onBounds={onBounds} {...props} />;
};

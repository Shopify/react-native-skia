import React from "react";

import type { CustomPaintProps, AnimatedProps } from "../../processors";
import { useDrawing } from "../../nodes/Drawing";
import type { SkTextBlob } from "../../../skia/TextBlob";

export interface TextBlobProps extends CustomPaintProps {
  blob: SkTextBlob;
  x: number;
  y: number;
}

export const TextBlob = (props: AnimatedProps<TextBlobProps>) => {
  const onDraw = useDrawing(props, ({ canvas, paint }, { blob, x, y }) => {
    canvas.drawTextBlob(blob, x, y, paint);
  });
  return <skDrawing onDraw={onDraw} {...props} />;
};

TextBlob.defaultProps = {
  x: 0,
  y: 0,
};

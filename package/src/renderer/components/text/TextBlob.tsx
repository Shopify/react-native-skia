import React from "react";

import type { CustomPaintProps, AnimatedProps } from "../../processors";
import { createDrawing } from "../../nodes/Drawing";
import type { SkTextBlob } from "../../../skia/TextBlob";

export interface TextBlobProps extends CustomPaintProps {
  blob: SkTextBlob;
  x: number;
  y: number;
}

const onDraw = createDrawing<TextBlobProps>(
  ({ canvas, paint }, { blob, x, y }) => {
    canvas.drawTextBlob(blob, x, y, paint);
  }
);

export const TextBlob = (props: AnimatedProps<TextBlobProps>) => {
  return <skDrawing onDraw={onDraw} {...props} />;
};

TextBlob.defaultProps = {
  x: 0,
  y: 0,
};

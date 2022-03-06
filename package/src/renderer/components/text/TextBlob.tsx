import React from "react";

import type { CustomPaintProps, AnimatedProps } from "../../processors";
import { useDrawing, useBounds } from "../../nodes/Drawing";
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
  const onBounds = useBounds(props, (_, { blob }) => {
    return blob.bounds();
  });
  return <skDrawing onDraw={onDraw} onBounds={onBounds} {...props} />;
};

TextBlob.defaultProps = {
  x: 0,
  y: 0,
};

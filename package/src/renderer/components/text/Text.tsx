import React from "react";

import type { CustomPaintProps } from "../../processors/Paint";
import { useDrawing } from "../../nodes/Drawing";
import type { Font } from "../../../skia/Font/Font";
import type { AnimatedProps } from "..";

interface TextProps extends CustomPaintProps {
  value: string;
  font: Font;
  x: number;
  y: number;
}

export const Text = (props: AnimatedProps<TextProps>) => {
  const onDraw = useDrawing(
    props,
    ({ canvas, paint }, { value, x, y, font }) => {
      canvas.drawText(value, x, y, paint, font);
    }
  );
  return <skDrawing onDraw={onDraw} {...props} />;
};

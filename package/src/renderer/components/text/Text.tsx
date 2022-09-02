import React from "react";

import type { CustomPaintProps, AnimatedProps } from "../../processors";
import { createDrawing } from "../../nodes/Drawing";
import type { SkFont } from "../../../skia/types";

type TextProps = CustomPaintProps & {
  font: SkFont;
  text: string;
  x: number;
  y: number;
};

const onDraw = createDrawing<TextProps>(
  ({ canvas, paint }, { text, x, y, ...fontDef }) => {
    const { font } = fontDef;
    canvas.drawText(text, x, y, paint, font);
  }
);

export const Text = (props: AnimatedProps<TextProps>) => {
  return <skDrawing onDraw={onDraw} {...props} />;
};

Text.defaultProps = {
  x: 0,
  y: 0,
};

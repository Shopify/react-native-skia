import React from "react";

import type {
  CustomPaintProps,
  AnimatedProps,
  FontDef,
} from "../../processors";
import { useDrawing } from "../../nodes/Drawing";
import { processFont } from "../../processors";

type TextProps = CustomPaintProps &
  FontDef & {
    text: string;
    x: number;
    y: number;
  };

export const Text = (props: AnimatedProps<TextProps>) => {
  const onDraw = useDrawing(
    props,
    ({ canvas, paint, fontMgr }, { text, x, y, ...fontDef }) => {
      const font = processFont(fontMgr, fontDef);
      canvas.drawText(text, x, y, paint, font);
    }
  );
  return <skDrawing onDraw={onDraw} {...props} />;
};

Text.defaultProps = {
  x: 0,
  y: 0,
};

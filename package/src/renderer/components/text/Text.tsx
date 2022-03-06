import React from "react";

import type {
  CustomPaintProps,
  AnimatedProps,
  FontDef,
} from "../../processors";
import { useDrawing, useBounds } from "../../nodes/Drawing";
import { processFont } from "../../processors";
import { rect } from "../../processors/Rects";

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
  const onBounds = useBounds(
    props,
    ({ fontMgr }, { text, x, y, ...fontDef }) => {
      const font = processFont(fontMgr, fontDef);
      const { width, height } = font.measureText(text);
      return rect(x, y, width, height);
    }
  );
  return <skDrawing onDraw={onDraw} onBounds={onBounds} {...props} />;
};

Text.defaultProps = {
  x: 0,
  y: 0,
};

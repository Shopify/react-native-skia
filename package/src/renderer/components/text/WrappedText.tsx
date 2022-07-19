import React from "react";

import type {
  CustomPaintProps,
  AnimatedProps,
  FontDef,
} from "../../processors";
import { createDrawing } from "../../nodes/Drawing";
import { processFont } from "../../processors";

type TextProps = CustomPaintProps &
  FontDef & {
    text: string;
    x: number;
    y: number;
  };

const onDraw = createDrawing<TextProps>(
  ({ canvas, paint, fontMgr, Skia }, { text, x, y, ...fontDef }) => {
    const font = processFont(Skia, fontMgr, fontDef);
    const padding = 16
    const measured = font.measureText(text)
    const paint2 = Skia.Paint();
    paint2.setColor(Skia.Color("#61DAFB"));
    canvas.drawRect({x:x-padding,y:y-measured.height-padding, width:measured.width+padding+padding, height:measured.height+padding+padding}, paint2)
    canvas.drawText(text, x, y, paint, font);
  }
);

export const WrappedText = (props: AnimatedProps<TextProps>) => {
  return <skDrawing onDraw={onDraw} {...props} />;
};

WrappedText.defaultProps = {
  x: 0,
  y: 0,
};

import React from "react";

import type { CustomPaintProps } from "../../processors/Paint";
import { useDrawing } from "../../nodes/Drawing";
import type { AnimatedProps } from "..";
import { Skia } from "../../../skia";

interface TextProps extends CustomPaintProps {
  value: string;
  familyName: string;
  size: number;
  x: number;
  y: number;
}

export const Text = (props: AnimatedProps<TextProps>) => {
  const onDraw = useDrawing(
    props,
    ({ canvas, paint, fontMgr }, { value, x, y, familyName, size }) => {
      const typeface = fontMgr.matchFamilyStyle(familyName);
      if (typeface === null) {
        throw new Error(`No typeface found for ${familyName}`);
      }
      const font = Skia.Font(typeface, size);
      canvas.drawText(value, x, y, paint, font);
    }
  );
  return <skDrawing onDraw={onDraw} {...props} />;
};

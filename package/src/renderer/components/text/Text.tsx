import React from "react";

import type { CustomPaintProps } from "../../processors/Paint";
import { useDrawing } from "../../nodes/Drawing";
import type { Font } from "../../../skia";
import { Skia } from "../../../skia";
import type { AnimatedProps } from "..";

type FontDef = { font: Font } | { familyName: string; size: number };

const isFont = (fontDef: FontDef): fontDef is { font: Font } =>
  // We use any here for safety (JSI instances don't have hasProperty working properly);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (fontDef as any).font !== undefined;

type TextProps = CustomPaintProps &
  FontDef & {
    value: string;
    x: number;
    y: number;
  };

export const Text = (props: AnimatedProps<TextProps>) => {
  const onDraw = useDrawing(
    props,
    ({ canvas, paint, fontMgr }, { value, x, y, ...fontDef }) => {
      let selectedFont: Font;
      if (isFont(fontDef)) {
        selectedFont = fontDef.font;
      } else {
        const { familyName, size } = fontDef;
        const typeface = fontMgr.matchFamilyStyle(familyName);
        if (typeface === null) {
          throw new Error(`No typeface found for ${familyName}`);
        }
        selectedFont = Skia.Font(typeface, size);
      }
      canvas.drawText(value, x, y, paint, selectedFont);
    }
  );
  return <skDrawing onDraw={onDraw} {...props} />;
};

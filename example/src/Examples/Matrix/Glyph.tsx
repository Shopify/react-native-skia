import React from "react";
import { Drawing, Skia } from "@shopify/react-native-skia";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
export const COLS = 14;
export const ROWS = 25;
export const GLYPH = { width: width / COLS, height: height / ROWS };

interface GlyphProps {
  i: number;
  j: number;
}

const typeface = Skia.Typeface();
const font = Skia.Font(typeface, GLYPH.height);
const paint = Skia.Paint();
paint.setColor(Skia.Color("rgb(0, 255, 70)"));

export const Glyph = ({ i, j }: GlyphProps) => {
  const a = `${Math.round(Math.random() * 9)}`;
  const m = font.measureText(a, paint);
  const x = i * GLYPH.width;
  const y = j * GLYPH.height;
  const dx = (GLYPH.width - m.width) / 2;
  const dy = (GLYPH.height - m.height) / 2;
  return (
    <>
      <Drawing
        onDraw={({ canvas }) => {
          canvas.drawText(a, x + dx, y + m.height + dy, font, paint);
        }}
      />
    </>
  );
};

import React, { useRef } from "react";
import type { AnimationValue } from "@shopify/react-native-skia";
import { Drawing, Skia } from "@shopify/react-native-skia";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
export const COLS = 14;
export const ROWS = 25;
export const GLYPH = { width: width / COLS, height: height / ROWS };

interface GlyphProps {
  i: number;
  j: number;
  progress: AnimationValue<number>;
}

const typeface = Skia.Typeface();
const font = Skia.Font(typeface, GLYPH.height);
const paint = Skia.Paint();
paint.setColor(Skia.Color("rgb(0, 255, 70)"));
const symbols = "abcdefghijklmnopqrstuvwxyz"
  .split("")
  .map((char) => ({ char, bounds: font.measureText(char, paint) }));

export const Glyph = ({ i, j, progress }: GlyphProps) => {
  const range = useRef(60 + Math.random() * 300);
  return (
    <>
      <Drawing
        onDraw={({ canvas }) => {
          const t = Math.floor(progress.value / range.current);
          const idx = t % (symbols.length - 1);
          const { bounds, char } = symbols[idx];
          const x = i * GLYPH.width;
          const y = j * GLYPH.height;
          const dx = (GLYPH.width - bounds.width) / 2;
          const dy = (GLYPH.height - bounds.height) / 2;
          canvas.drawText(char, x + dx, y + bounds.height + dy, font, paint);
        }}
      />
    </>
  );
};

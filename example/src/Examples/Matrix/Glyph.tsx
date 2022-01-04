import React, { useRef } from "react";
import type { AnimationValue } from "@shopify/react-native-skia";
import {
  interpolate,
  interpolateColors,
  Drawing,
  Skia,
} from "@shopify/react-native-skia";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
export const COLS = 14;
export const ROWS = 25;
export const GLYPH = { width: width / COLS, height: height / ROWS };

interface GlyphProps {
  i: number;
  j: number;
  progress: AnimationValue<number>;
  value: number;
}

const typeface = Skia.Typeface();
const font = Skia.Font(typeface, GLYPH.height);
const symbols = "0123456789" //abcdefghijklmnopqrstuvwxyz
  .split("")
  .map((char) => ({ char, bounds: font.measureText(char) }));

export const Glyph = ({ i, j, progress, value }: GlyphProps) => {
  const range = useRef(60 + Math.random() * 300);
  return (
    <>
      <Drawing
        onDraw={({ canvas }) => {
          const t = Math.floor(progress.value / range.current);
          const paint = Skia.Paint();
          paint.setColor(
            interpolateColors(
              value,
              [0.8, 1],
              ["rgb(0, 255, 70)", "rgb(140, 255, 170)"]
            )
          );
          paint.setAlphaf(value);
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

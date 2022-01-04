import React, { useRef } from "react";
import type { AnimationValue } from "@shopify/react-native-skia";
import {
  interpolate,
  interpolateColors,
  Drawing,
  Skia,
} from "@shopify/react-native-skia";
import { Dimensions } from "react-native";

const resolveAssetSource = require("react-native/Libraries/Image/resolveAssetSource");

const { width, height } = Dimensions.get("window");
export const COLS = 14;
export const ROWS = 25;
export const GLYPH = { width: width / COLS, height: height / ROWS };

console.log(resolveAssetSource(require("./matrix-code-nfi.otf")));

interface GlyphProps {
  i: number;
  j: number;
  progress: AnimationValue<number>;
  stream: number[];
}

const typeface = Skia.Typeface();
const font = Skia.Font(typeface, GLYPH.height);
const symbols = "0123456789".split("").map((char) => ({
  char,
  bounds: font.measureText(char),
}));
const SPEED = 0.01;
// const shift = (stream: number[], index: number) =>
//   stream.slice(index).concat(stream.slice(0, index));

const shiftReverse = (stream: number[], index: number) => {
  const j = stream.length - 1 - index;
  return stream.slice(j).concat(stream.slice(0, j));
};

export const Glyph = ({ i, j, progress, stream }: GlyphProps) => {
  const range = useRef(60 + Math.random() * 300);
  return (
    <Drawing
      onDraw={({ canvas, paint }) => {
        const index = Math.round((progress.value * SPEED) % stream.length);
        const value = shiftReverse(stream, index)[j];
        const t = Math.floor(progress.value / range.current);
        const p = paint.copy();
        p.setColor(
          interpolateColors(
            value,
            [0.8, 1],
            ["rgb(0, 255, 70)", "rgb(140, 255, 170)"]
          )
        );
        p.setAlphaf(value);
        const idx = t % (symbols.length - 1);
        const { bounds, char } = symbols[idx];
        const x = i * GLYPH.width;
        const y = j * GLYPH.height;
        const dx = (GLYPH.width - bounds.width) / 2;
        const dy = (GLYPH.height - bounds.height) / 2;
        canvas.drawText(char, x + dx, y + bounds.height + dy, font, p);
      }}
    />
  );
};

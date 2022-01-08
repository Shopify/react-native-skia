import React, { useRef } from "react";
import type { AnimationValue, Font } from "@shopify/react-native-skia";
import { interpolateColors, Text } from "@shopify/react-native-skia";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
export const COLS = 8;
export const ROWS = 15;
export const GLYPH = { width: width / COLS, height: height / ROWS };
const symbols = "abcdefghijklmnopqrstuvwxyz".split("");

interface GlyphProps {
  i: number;
  j: number;
  progress: AnimationValue<number>;
  stream: number[];
  font: Font;
}

const SPEED = 0.015;
// const shift = (stream: number[], index: number) =>
//   stream.slice(index).concat(stream.slice(0, index));

const shiftReverse = (stream: number[], index: number) => {
  const j = stream.length - 1 - index;
  return stream.slice(j).concat(stream.slice(0, j));
};

export const Glyph = ({ i, j, progress, stream, font }: GlyphProps) => {
  const offset = useRef(Math.round(Math.random() * (symbols.length - 1)));
  const range = useRef(50 + Math.random() * 500);
  const x = i * GLYPH.width;
  const y = j * GLYPH.height;
  const value = () => {
    const t = Math.floor(progress.value / range.current);
    const idx = (offset.current + t) % (symbols.length - 1);
    return symbols[idx];
  };
  const opacity = () => {
    const index = Math.round((progress.value * SPEED) % stream.length);
    return shiftReverse(stream, index)[j];
  };
  return (
    <Text
      x={x}
      y={y}
      font={font}
      value={value}
      opacity={opacity}
      color={() =>
        interpolateColors(
          opacity(),
          [0.8, 1],
          ["rgb(0, 255, 70)", "rgb(140, 255, 170)"]
        )
      }
    />
  );
};

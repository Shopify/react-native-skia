import type { FC } from "react";
import React, { useRef } from "react";
import type {
  AnimatedProps,
  AnimationValue,
  Font,
  IRect,
} from "@shopify/react-native-skia";
import {
  materialize,
  interpolateColors,
  Text,
} from "@shopify/react-native-skia";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
export const COLS = 8;
export const ROWS = 15;
export const GLYPH = { width: width / COLS, height: height / ROWS };

interface GlyphProps {
  i: number;
  j: number;
  progress: AnimationValue<number>;
  stream: number[];
  symbols: { char: string; bounds: IRect }[];
  font: Font;
}

const SPEED = 0.015;
// const shift = (stream: number[], index: number) =>
//   stream.slice(index).concat(stream.slice(0, index));

const shiftReverse = (stream: number[], index: number) => {
  const j = stream.length - 1 - index;
  return stream.slice(j).concat(stream.slice(0, j));
};

export const Glyph = ({
  i,
  j,
  progress,
  stream,
  symbols,
  font,
}: GlyphProps) => {
  const range = useRef(300 + Math.random() * 300);
  const text = () => {
    const index = Math.round((progress.value * SPEED) % stream.length);
    const opacity = shiftReverse(stream, index)[j];
    const t = Math.floor(progress.value / range.current);
    const color = interpolateColors(
      opacity,
      [0.8, 1],
      ["rgb(0, 255, 70)", "rgb(140, 255, 170)"]
    );
    const idx = t % (symbols.length - 1);
    const { bounds, char } = symbols[idx];
    const x = i * GLYPH.width;
    const y = j * GLYPH.height;
    const dx = (GLYPH.width - bounds.width) / 2;
    const dy = (GLYPH.height - bounds.height) / 2;
    return {
      value: char,
      x: x + dx,
      y: y + bounds.height + dy,
      color,
      opacity,
    };
  };
  return (
    <Text
      value={() => text().value}
      x={() => text().x}
      y={() => text().y}
      font={font}
      color={() => text().color}
      opacity={() => text().opacity}
    />
  );
};

import React, { useRef } from "react";
import type { Font, IReadonlyValue } from "@shopify/react-native-skia";
import {
  useDerivedValue,
  interpolateColors,
  Text,
} from "@shopify/react-native-skia";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
export const COLS = 8;
export const ROWS = 15;
export const SYMBOL = { width: width / COLS, height: height / ROWS };
const symbols = "abcdefghijklmnopqrstuvwxyz".split("");

interface SymbolProps {
  i: number;
  j: number;
  timestamp: IReadonlyValue<number>;
  stream: number[];
  font: Font;
}

export const Symbol = ({ i, j, timestamp, stream, font }: SymbolProps) => {
  const offset = useRef(Math.round(Math.random() * (symbols.length - 1)));
  const range = useRef(100 + Math.random() * 900);
  const x = i * SYMBOL.width;
  const y = j * SYMBOL.height;
  const value = useDerivedValue(
    (t) => {
      const idx = offset.current + Math.floor(t / range.current);
      return symbols[idx % symbols.length];
    },
    [timestamp]
  );

  const opacity = useDerivedValue(
    (t) => {
      const idx = Math.round(t / 100);
      return stream[(stream.length - j + idx) % stream.length];
    },
    [timestamp]
  );

  const color = useDerivedValue(
    (o) =>
      interpolateColors(o, [0.8, 1], ["rgb(0, 255, 70)", "rgb(140, 255, 170)"]),
    [opacity]
  );

  return (
    <Text
      x={x + SYMBOL.width / 4}
      y={y + SYMBOL.height}
      font={font}
      value={value}
      opacity={opacity}
      color={color}
    />
  );
};

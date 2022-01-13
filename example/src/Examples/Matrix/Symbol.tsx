import React, { useRef } from "react";
import type { AnimationValue } from "@shopify/react-native-skia";
import { Text } from "@shopify/react-native-skia";
import { Dimensions } from "react-native";

import { interpolateColors } from "../../../../package/src/animation/functions/interpolateColors";

const { width, height } = Dimensions.get("window");
export const COLS = 8;
export const ROWS = 15;
export const SYMBOL = { width: width / COLS, height: height / ROWS };
const symbols = "abcdefghijklmnopqrstuvwxyz".split("");

interface SymbolProps {
  i: number;
  j: number;
  timestamp: AnimationValue<number>;
  stream: number[];
}

export const Symbol = ({ i, j, timestamp, stream }: SymbolProps) => {
  const offset = useRef(Math.round(Math.random() * (symbols.length - 1)));
  const range = useRef(100 + Math.random() * 900);
  const x = i * SYMBOL.width;
  const y = j * SYMBOL.height;
  const value = () => {
    const idx = offset.current + Math.floor(timestamp.value / range.current);
    return symbols[idx % symbols.length];
  };
  const opacity = () => {
    const idx = Math.round(timestamp.value / 100);
    return stream[(stream.length - j + idx) % stream.length];
  };
  return (
    <Text
      x={x + SYMBOL.width / 4}
      y={y + SYMBOL.height}
      familyName="Matrix Code NFI"
      size={SYMBOL.height}
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

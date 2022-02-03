import React, { useRef } from "react";
import type { AnimationValue, Font } from "@shopify/react-native-skia";
import { vec, Text, Glyphs } from "@shopify/react-native-skia";
import { Dimensions } from "react-native";

import { interpolateColors } from "../../../../package/src/animation/functions/interpolateColors";

const { width, height } = Dimensions.get("window");
export const COLS = 8;
export const ROWS = 15;
export const SYMBOL = { width: width / COLS, height: height / ROWS };
const symbols = "abcdefghijklmnopqrstuvwxyz".toUpperCase().split("");

interface SymbolProps {
  i: number;
  j: number;
  timestamp: AnimationValue<number>;
  stream: number[];
  font: Font;
}

export const Symbol = ({ i, j, timestamp, stream, font }: SymbolProps) => {
  const offset = useRef(Math.round(Math.random() * (symbols.length - 1)));
  const range = useRef(100 + Math.random() * 900);
  const x = i * SYMBOL.width;
  const y = j * SYMBOL.height;
  const glyphs = () => {
    const idx = offset.current + Math.floor(timestamp.value / range.current);
    return [
      { id: symbols[idx % symbols.length].codePointAt(0), pos: vec(0, 0) },
    ];
  };
  const opacity = () => {
    const idx = Math.round(timestamp.value / 100);
    return stream[(stream.length - j + idx) % stream.length];
  };
  return (
    <Glyphs
      x={x + SYMBOL.width / 4}
      y={y + SYMBOL.height}
      font={font}
      glyphs={glyphs}
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
  // Alternative implementation using <Text />
  // return (
  //   <Text
  //     x={x + SYMBOL.width / 4}
  //     y={y + SYMBOL.height}
  //     font={font}
  //     value={value}
  //     opacity={opacity}
  //     color={() =>
  //       interpolateColors(
  //         opacity(),
  //         [0.8, 1],
  //         ["rgb(0, 255, 70)", "rgb(140, 255, 170)"]
  //       )
  //     }
  //   />
  // );
};

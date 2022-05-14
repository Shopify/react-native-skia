import type {
  SkFont,
  Vector,
  SkiaReadonlyValue,
} from "@shopify/react-native-skia";
import {
  interpolate,
  dist,
  mix,
  useDerivedValue,
  vec,
  Group,
  Text,
} from "@shopify/react-native-skia";
import React from "react";
import { Dimensions } from "react-native";

import { FG } from "./Theme";

const { width, height } = Dimensions.get("window");
export const COLS = 10;
export const ROWS = 15;
export const SIZE = { width: width / COLS, height: height / ROWS };
const DIGITS = new Array(10).fill(0).map((_, i) => `${i}`);
const F = 0.009;
const R = 125;

interface SymbolProps {
  x: number;
  y: number;
  font: SkFont;
  pointer: SkiaReadonlyValue<Vector>;
}

export const Symbol = ({ x, y, font, pointer }: SymbolProps) => {
  const text = DIGITS[Math.round(Math.random() * 9)];
  const pos = font.measureText(text);
  const origin = vec(x + SIZE.width / 2, y + SIZE.height / 2);
  const transform = useDerivedValue(
    () => [
      {
        scale: interpolate(
          dist(pointer.current, origin),
          [0, R],
          [1.25, 0.25],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        ),
      },
    ],
    [pointer]
  );
  return (
    <Group transform={transform} origin={origin}>
      <Text
        text={text}
        x={origin.x - pos.width / 2}
        y={origin.y + pos.height / 2}
        font={font}
        color={FG}
      />
    </Group>
  );
};

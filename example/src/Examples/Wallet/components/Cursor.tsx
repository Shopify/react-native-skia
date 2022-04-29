import type { SkiaReadonlyValue } from "@shopify/react-native-skia";
import {
  interpolateColors,
  Circle,
  Group,
  useDerivedValue,
  Paint,
} from "@shopify/react-native-skia";
import React from "react";

import { COLORS, WIDTH } from "../Model";

interface CursorProps {
  x: SkiaReadonlyValue<number>;
  y: SkiaReadonlyValue<number>;
}

export const Cursor = ({ x, y }: CursorProps) => {
  const color = useDerivedValue(
    () =>
      interpolateColors(
        x.current / WIDTH,
        COLORS.map((_, i) => i / COLORS.length),
        COLORS
      ),
    [x]
  );
  return (
    <Group>
      <Circle cx={x} cy={y} r={27} color={color} opacity={0.15} />
      <Circle cx={x} cy={y} r={18} color={color} opacity={0.15} />
      <Circle cx={x} cy={y} r={9} color={color}>
        <Paint style="stroke" strokeWidth={2} color="white" />
      </Circle>
    </Group>
  );
};

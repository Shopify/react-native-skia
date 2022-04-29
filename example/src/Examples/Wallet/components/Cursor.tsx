import type { SkiaReadonlyValue, Vector } from "@shopify/react-native-skia";
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
  c: SkiaReadonlyValue<Vector>;
}

export const Cursor = ({ c }: CursorProps) => {
  const color = useDerivedValue(
    () =>
      interpolateColors(
        c.current.x / WIDTH,
        COLORS.map((_, i) => i / COLORS.length),
        COLORS
      ),
    [c]
  );
  return (
    <Group>
      <Circle c={c} r={27} color={color} opacity={0.15} />
      <Circle c={c} r={18} color={color} opacity={0.15} />
      <Circle c={c} r={9} color={color}>
        <Paint style="stroke" strokeWidth={2} color="white" />
      </Circle>
    </Group>
  );
};

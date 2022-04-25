import type { SkiaReadonlyValue, Vector } from "@shopify/react-native-skia";
import {
  Paint,
  dist,
  interpolateColors,
  Circle,
  Shadow,
  Group,
  useDerivedValue,
} from "@shopify/react-native-skia";
import React from "react";

import { COLORS } from "../Model";

interface CursorProps {
  start: SkiaReadonlyValue<Vector>;
  end: SkiaReadonlyValue<Vector>;
  c: SkiaReadonlyValue<Vector>;
}

export const Cursor = ({ c, start, end }: CursorProps) => {
  const color = useDerivedValue(
    () =>
      interpolateColors(
        dist(start.current, c.current) / dist(start.current, end.current),
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

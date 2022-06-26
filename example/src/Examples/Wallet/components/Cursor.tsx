import type { SkiaValue } from "@shopify/react-native-skia";
import {
  interpolateColors,
  Circle,
  Group,
  useComputedValue,
  Paint,
} from "@shopify/react-native-skia";
import React from "react";

import { COLORS } from "../Model";

interface CursorProps {
  x: SkiaValue<number>;
  y: SkiaValue<number>;
  width: number;
}

export const Cursor = ({ x, y, width }: CursorProps) => {
  const color = useComputedValue(
    () =>
      interpolateColors(
        x.current / width,
        COLORS.map((_, i) => i / COLORS.length),
        COLORS
      ),
    [x]
  );
  const transform = useComputedValue(
    () => [{ translateX: x.current }, { translateY: y.current }],
    [x, y]
  );
  return (
    <Group transform={transform}>
      <Circle cx={0} cy={0} r={27} color={color} opacity={0.15} />
      <Circle cx={0} cy={0} r={18} color={color} opacity={0.15} />
      <Circle cx={0} cy={0} r={9} color={color}>
        <Paint style="stroke" strokeWidth={2} color="white" />
      </Circle>
    </Group>
  );
};

import type { SkiaValue } from "@shopify/react-native-skia";
import {
  BoxShadow,
  Box,
  rect,
  rrect,
  RoundedRect,
  Group,
  translate,
  LinearGradient,
  vec,
  useComputedValue,
} from "@shopify/react-native-skia";
import React from "react";

import { Knob } from "./Knob";

interface SliderProps {
  x: number;
  y: number;
  progress: SkiaValue<number>;
}

export const Slider = ({ x, y, progress }: SliderProps) => {
  const width = useComputedValue(() => progress.current * 192, [progress]);
  const transform = useComputedValue(
    () => [{ translateX: progress.current * 192 }],
    [progress]
  );
  return (
    <Group transform={translate({ x, y })}>
      <Box box={rrect(rect(0, 3.5, 192, 8), 25, 25)} color="#1B1B1D">
        <BoxShadow
          dx={-1.25}
          dy={-1.25}
          blur={6}
          color="rgba(255, 255, 255, 0.8)"
          inner
        />
        <BoxShadow
          dx={1.25}
          dy={1.25}
          blur={6}
          color="rgba(0, 0, 0, 0.8)"
          inner
        />
      </Box>
      <Group>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(0, 192)}
          colors={["#2FB8FF", "#9EECD9"]}
        />
        <RoundedRect x={0} y={3.5} width={width} height={8} r={25} />
      </Group>
      <Group transform={transform}>
        <Knob />
      </Group>
    </Group>
  );
};

import type { SkiaReadonlyValue } from "@shopify/react-native-skia";
import {
  RoundedRect,
  Paint,
  Shadow,
  Group,
  translate,
  LinearGradient,
  vec,
  useDerivedValue,
} from "@shopify/react-native-skia";
import React from "react";

import { Knob } from "./Knob";

interface SliderProps {
  x: number;
  y: number;
  progress: SkiaReadonlyValue<number>;
}

export const Slider = ({ x, y, progress }: SliderProps) => {
  const width = useDerivedValue(() => progress.current * 192, [progress]);
  const transform = useDerivedValue(
    () => [{ translateX: progress.current * 192 }],
    [progress]
  );
  return (
    <Group transform={translate({ x, y })}>
      <Group>
        <Paint>
          <Shadow
            dx={-1.25}
            dy={-1.25}
            color="rgba(255, 255, 255, 0.8)"
            blur={6}
            inner
          />
          <Shadow
            dx={1.25}
            dy={1.25}
            color="rgba(0, 0, 0, 0.8)"
            blur={6}
            inner
          />
        </Paint>
        <RoundedRect
          x={0}
          y={3.5}
          width={192}
          height={8}
          r={25}
          color="#1B1B1D"
        />
      </Group>
      <Group>
        <Paint>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, 192)}
            colors={["#2FB8FF", "#9EECD9"]}
          />
        </Paint>
        <RoundedRect x={0} y={3.5} width={width} height={8} r={25} />
      </Group>
      <Group transform={transform}>
        <Knob />
      </Group>
    </Group>
  );
};

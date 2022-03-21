import {
  RoundedRect,
  Paint,
  InnerShadow,
  Group,
  translate,
  LinearGradient,
  vec,
  BlurMask,
} from "@shopify/react-native-skia";
import React from "react";

import { Knob } from "./Knob";

interface SliderProps {
  progress: number;
  active: boolean;
  x: number;
  y: number;
}

export const Slider = ({ x, y, progress, active }: SliderProps) => {
  return (
    <Group transform={translate({ x, y })}>
      <Group>
        <Paint>
          <InnerShadow
            dx={-1.25}
            dy={-1.25}
            color="rgba(255, 255, 255, 0.8)"
            blur={6}
          />
          <InnerShadow
            dx={1.25}
            dy={1.25}
            color="rgba(0, 0, 0, 0.8)"
            blur={6}
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
          <BlurMask style="solid" blur={1} />
        </Paint>
        <RoundedRect x={0} y={3.5} width={progress * 192} height={8} r={25} />
      </Group>
      <Group transform={[{ translateX: progress * 192 }]}>
        <Knob />
      </Group>
    </Group>
  );
};

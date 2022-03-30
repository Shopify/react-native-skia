import React from "react";
import type { SkiaReadonlyValue, SkRRect } from "@shopify/react-native-skia";
import {
  BlurMask,
  mix,
  useDerivedValue,
  RoundedRect,
  Group,
  LinearGradient,
  Paint,
  vec,
} from "@shopify/react-native-skia";

import { useGradientsColors } from "./Canvas";

interface BaseCardProps {
  mode: SkiaReadonlyValue<number>;
  rect: SkRRect;
  y: number;
}

export const BaseCard = ({
  mode,
  rect: { rect },
  rect: rrect,
  y,
}: BaseCardProps) => {
  const colors = useGradientsColors(mode);
  const blur = useDerivedValue(() => mix(mode.current, 0, 100), [mode]);
  return (
    <Group y={y}>
      <Paint>
        <LinearGradient
          start={vec(rect.x, rect.y)}
          end={vec(rect.x + rect.width, 0)}
          colors={colors}
        />
        <BlurMask blur={blur} style="solid" />
      </Paint>
      <RoundedRect rect={rrect} />
    </Group>
  );
};

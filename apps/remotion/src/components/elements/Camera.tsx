import type { ReactNode } from "react";
import { interpolate } from "remotion";
import type { Vector } from "@shopify/react-native-skia";
import {
  Group,
  interpolateVector,
  transformOrigin,
} from "@shopify/react-native-skia";

import { CLAMP } from "../animations";

export interface CameraTransform {
  center: Vector;
  scale: number;
}

interface CameraProps {
  value: number;
  children: ReactNode[];
  inputRange: number[];
  outputRange: CameraTransform[];
}

export const Camera = ({
  value,
  children,
  inputRange,
  outputRange,
}: CameraProps) => {
  const scale = interpolate(
    value,
    inputRange,
    outputRange.map((c) => c.scale),
    CLAMP
  );
  const origin = interpolateVector(
    value,
    inputRange,
    outputRange.map((c) => c.center),
    CLAMP
  );
  return (
    <Group transform={transformOrigin(origin, [{ scale }])}>{children}</Group>
  );
};

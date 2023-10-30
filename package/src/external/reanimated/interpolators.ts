import type { ExtrapolationType, SharedValue } from "react-native-reanimated";
import { useMemo } from "react";

import type { SkPath, SkPoint } from "../../skia/types";
import { interpolatePaths, interpolateVector } from "../../animation";
import { Skia } from "../../skia";

import {
  useAnimatedReaction,
  useFrameCallback,
  useSharedValue,
} from "./moduleWrapper";

export const notifiyChange = (value: SharedValue<unknown>) => {
  "worklet";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (value as any)._value = value.value;
};

export const useClock = () => {
  const clock = useSharedValue(0);
  useFrameCallback((info) => {
    clock.value = info.timeSinceFirstFrame;
  });
  return clock;
};

/**
 * @worklet
 */
type Interpolator<T> = (
  value: number,
  input: number[],
  output: T[],
  options: ExtrapolationType,
  result: T
) => T;

const useInterpolator = <T>(
  factory: () => T,
  value: SharedValue<number>,
  interpolator: Interpolator<T>,
  input: number[],
  output: T[],
  options?: ExtrapolationType
) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const init = useMemo(() => factory(), []);
  const result = useSharedValue(init);
  useAnimatedReaction(
    () => value.value,
    (val) => {
      result.value = interpolator(val, input, output, options, result.value);
      notifiyChange(result);
    },
    [input, output, options]
  );
  return result;
};

export const usePathInterpolation = (
  value: SharedValue<number>,
  input: number[],
  outputRange: SkPath[],
  options?: ExtrapolationType
) =>
  useInterpolator(
    () => Skia.Path.Make(),
    value,
    interpolatePaths,
    input,
    outputRange,
    options
  );

export const useVectorInterpolation = (
  value: SharedValue<number>,
  input: number[],
  outputRange: SkPoint[],
  options?: ExtrapolationType
) =>
  useInterpolator(
    () => Skia.Point(0, 0),
    value,
    interpolateVector,
    input,
    outputRange,
    options
  );

// useMatrixInterpolation
// useColorInterpolation
// useRectInterpolation
// useRRectInterpolation

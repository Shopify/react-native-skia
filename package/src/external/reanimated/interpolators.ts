import type {
  ExtrapolationType,
  FrameInfo,
  SharedValue,
} from "react-native-reanimated";
import { useMemo, useRef } from "react";

import type { SkPath, SkPoint } from "../../skia/types";
import { interpolatePaths, interpolateVector } from "../../animation";
import { Skia } from "../../skia";

import {
  useAnimatedReaction,
  useFrameCallback,
  useSharedValue,
  useDerivedValue
} from "./moduleWrapper";

export const notifyChange = (value: SharedValue<unknown>) => {
  "worklet";
  if (_WORKLET) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (value as any)._value = value.value;
  }
};

export const usePathValue = (cb: (path: SkPath) => void) => {
  const pathInit = useMemo(() => Skia.Path.Make(), []);
  const path = useSharedValue(pathInit);
  useDerivedValue(() => {
    path.value.reset();
    cb(path.value);
    notifyChange(path);
  });
  return path;
};

export const useClock = () => {
  const clock = useSharedValue(0);
  const callback = useRef((info: FrameInfo) => {
    "worklet";
    clock.value = info.timeSinceFirstFrame;
  }).current;
  useFrameCallback(callback);
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
      notifyChange(result);
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

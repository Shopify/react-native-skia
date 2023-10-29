import type { ExtrapolationType, SharedValue } from "react-native-reanimated";
import { useMemo } from "react";

import type { SkPath } from "../../skia/types";
import { Skia } from "../../skia";
import { interpolatePaths } from "../../animation";

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

export const usePathInterpolation = (
  value: SharedValue<number>,
  input: number[],
  outputRange: SkPath[],
  options?: ExtrapolationType
) => {
  const path = useMemo(() => Skia.Path.Make(), []);
  const output = useSharedValue(path);
  useAnimatedReaction(
    () => value.value,
    (val) => {
      interpolatePaths(val, input, outputRange, options, output.value);
      notifiyChange(output);
    }
  );
  return output;
};

// usePointInterpolation
// useMaxtrixInterpolation
// useColorInterpolation
// useRectInterpolation
// useRRectInterpolation

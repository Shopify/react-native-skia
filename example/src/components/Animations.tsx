import {
  interpolatePaths,
  Skia,
  type SkPath,
} from "@shopify/react-native-skia";
import { useEffect } from "react";
import type { ExtrapolationType, SharedValue } from "react-native-reanimated";
import {
  Easing,
  cancelAnimation,
  useAnimatedReaction,
  useFrameCallback,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export const useLoop = ({ duration }: { duration: number }) => {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    return () => {
      cancelAnimation(progress);
    };
  }, [duration, progress]);
  return progress;
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
  const output = useSharedValue(Skia.Path.Make());
  useAnimatedReaction(
    () => value.value,
    (val) => {
      interpolatePaths(val, input, outputRange, options, output.value);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (output as any)._value = output.value;
    }
  );
  return output;
};

const fade = (t: number) => {
  "worklet";
  return t * t * t * (t * (t * 6 - 15) + 10);
};

const lerp = (a: number, b: number, t: number) => {
  "worklet";
  return (1 - t) * a + t * b;
};

const grad = (hash: number, x: number, y: number) => {
  "worklet";
  const h = hash & 15;
  //const grad = 1 + (h & 7); // Gradient value is one of 8 possible values (1, 2, ..., 8)
  return (h & 8 ? -x : x) + (h & 4 ? -y : y);
};

// This is the "seed" for the noise. The permutation table. Randomly shuffle it for different results.
const shuffleArray = (array: number[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

export const getSeed = () => {
  let p = [...Array(512)].map(() => Math.floor(Math.random() * 256));
  shuffleArray(p);
  p = p.concat(p);
  return p;
};

export const perlin = (seed: number[], x: number, y: number) => {
  "worklet";
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  x -= Math.floor(x);
  y -= Math.floor(y);
  const u = fade(x);
  const v = fade(y);
  const a = seed[X] + Y;
  const b = seed[X + 1] + Y;
  return lerp(
    lerp(grad(seed[a], x, y), grad(seed[b], x - 1, y), u),
    lerp(grad(seed[a + 1], x, y - 1), grad(seed[b + 1], x - 1, y - 1), u),
    v
  );
};

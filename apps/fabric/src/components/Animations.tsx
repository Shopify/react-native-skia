import type { Vector } from "@shopify/react-native-skia";
import { useVideo } from "@shopify/react-native-skia";
import { useAssets } from "expo-asset";
import { useEffect } from "react";
import {
  Easing,
  cancelAnimation,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export const useVideoFromAsset = (
  mod: number,
  options?: Parameters<typeof useVideo>[1]
) => {
  const [assets, error] = useAssets([mod]);
  if (error) {
    throw error;
  }
  return useVideo(assets ? assets[0].localUri : null, options);
};

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

export const translate = ({
  x,
  y,
}: Vector): [{ translateX: number }, { translateY: number }] => {
  "worklet";
  return [{ translateX: x }, { translateY: y }];
};

export const snapPoint = (
  value: number,
  velocity: number,
  points: ReadonlyArray<number>
): number => {
  "worklet";
  const point = value + 0.2 * velocity;
  const deltas = points.map((p) => Math.abs(point - p));
  const minDelta = Math.min.apply(null, deltas);
  return points.filter((p) => Math.abs(point - p) === minDelta)[0];
};

import { useEffect } from "react";
import {
  Easing,
  cancelAnimation,
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

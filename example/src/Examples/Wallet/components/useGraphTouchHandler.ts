import type { SharedValue } from "react-native-reanimated";
import { withDecay } from "react-native-reanimated";
import { Gesture } from "react-native-gesture-handler";
import { useMemo } from "react";

export const useGraphTouchHandler = (
  x: SharedValue<number>,
  y: SharedValue<number>,
  width: number
) => {
  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .onChange((pos) => {
          x.value += pos.x;
          y.value += pos.y;
        })
        .onEnd(({ velocityX }) => {
          x.value = withDecay({ velocity: velocityX, clamp: [0, width] });
        }),
    [width, x, y]
  );
  return gesture;
};

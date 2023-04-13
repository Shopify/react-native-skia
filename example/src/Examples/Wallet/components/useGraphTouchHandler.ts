import { vec, add, dist, clamp } from "@shopify/react-native-skia";
import type { SharedValue } from "react-native-reanimated";
import { useSharedValue, withDecay } from "react-native-reanimated";
import { Gesture } from "react-native-gesture-handler";

import { PADDING } from "../Model";

export const useGraphTouchHandler = (
  x: SharedValue<number>,
  y: SharedValue<number>,
  width: number,
  height: number
) => {
  const translateY = height + PADDING;
  const gestureActive = useSharedValue(false);
  const offsetX = useSharedValue(0);
  return Gesture.Pan()
    .onBegin((pos) => {
      const normalizedCenter = add(vec(x.value, y.value), vec(0, translateY));
      if (dist(normalizedCenter, pos) < 50) {
        gestureActive.value = true;
        offsetX.value = x.value - pos.x;
      }
    })
    .onChange((pos) => {
      if (gestureActive.value) {
        x.value = clamp(offsetX.value + pos.x, 0, width);
      }
    })
    .onEnd(({ velocityX }) => {
      if (gestureActive.value) {
        gestureActive.value = false;
        x.value = withDecay({ velocity: velocityX, clamp: [0, width] });
      }
    });
};

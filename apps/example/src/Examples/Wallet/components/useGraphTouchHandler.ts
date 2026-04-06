<<<<<<< HEAD
import type { SharedValue } from "react-native-reanimated";
import { withDecay } from "react-native-reanimated";
import { Gesture } from "react-native-gesture-handler";
import { useMemo } from "react";
=======
import { useMemo } from "react";
import { Gesture } from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";

const clamp = (value: number, lower: number, upper: number) => {
  "worklet";
  return Math.min(Math.max(value, lower), upper);
};
>>>>>>> main

export const useGraphTouchHandler = (x: SharedValue<number>, width: number) => {
  const gesture = useMemo(
    () =>
      Gesture.Pan()
<<<<<<< HEAD
        .onChange((pos) => {
          x.value += pos.x;
        })
        .onEnd(({ velocityX }) => {
          x.value = withDecay({ velocity: velocityX, clamp: [0, width] });
=======
        .minDistance(0)
        .onStart((event) => {
          "worklet";
          x.value = clamp(event.x, 0, width);
        })
        .onChange((event) => {
          "worklet";
          x.value = clamp(event.x, 0, width);
        })
        .onEnd((event) => {
          "worklet";
          // Snap to the last touched point instead of letting decay push it further.
          x.value = clamp(event.x, 0, width);
>>>>>>> main
        }),
    [width, x]
  );
  return gesture;
};

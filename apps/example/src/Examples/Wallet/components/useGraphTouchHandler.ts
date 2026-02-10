import { useMemo } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import type { SharedValue } from 'react-native-reanimated';

const clamp = (value: number, lower: number, upper: number) => {
  'worklet';
  return Math.min(Math.max(value, lower), upper);
};

export const useGraphTouchHandler = (x: SharedValue<number>, width: number) => {
  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .onStart((event) => {
          'worklet';
          x.value = clamp(event.x, 0, width);
        })
        .onChange((event) => {
          'worklet';
          x.value = clamp(event.x, 0, width);
        })
        .onEnd((event) => {
          'worklet';
          // Snap to the last touched point instead of letting decay push it further.
          x.value = clamp(event.x, 0, width);
        }),
    [width, x]
  );
  return gesture;
};

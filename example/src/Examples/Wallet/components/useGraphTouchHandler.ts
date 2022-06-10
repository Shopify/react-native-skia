import type { SkiaMutableValue, SkiaValue } from "@shopify/react-native-skia";
import {
  runDecay,
  add,
  clamp,
  dist,
  vec,
  useValue,
  useTouchHandler,
} from "@shopify/react-native-skia";

import { PADDING } from "../Model";

export const useGraphTouchHandler = (
  x: SkiaMutableValue<number>,
  y: SkiaValue<number>,
  width: number,
  height: number
) => {
  const translateY = height + PADDING;
  const gestureActive = useValue(false);
  const offsetX = useValue(0);
  const onTouch = useTouchHandler({
    onStart: (pos) => {
      const normalizedCenter = add(
        vec(x.current, y.current),
        vec(0, translateY)
      );
      if (dist(normalizedCenter, pos) < 50) {
        gestureActive.current = true;
        offsetX.current = x.current - pos.x;
      }
    },
    onActive: (pos) => {
      if (gestureActive.current) {
        x.current = clamp(offsetX.current + pos.x, 0, width);
      }
    },
    onEnd: ({ velocityX }) => {
      if (gestureActive.current) {
        gestureActive.current = false;
        runDecay(x, { velocity: velocityX, clamp: [0, width] });
      }
    },
  });
  return onTouch;
};

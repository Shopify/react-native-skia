import type { SkMatrix, SkRect } from "@shopify/react-native-skia";
import { Skia } from "@shopify/react-native-skia";
import React from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { rotateZ, toM4, translate, scale } from "./MatrixHelpers";

interface GestureHandlerProps {
  matrix: SharedValue<SkMatrix>;
  dimensions: SkRect;
  debug?: boolean;
}

export const GestureHandler = ({
  matrix,
  dimensions,
  debug,
}: GestureHandlerProps) => {
  const { x, y, width, height } = dimensions;
  const origin = useSharedValue(Skia.Point(0, 0));
  const offset = useSharedValue(Skia.Matrix());

  const pan = Gesture.Pan().onChange((e) => {
    matrix.value = translate(matrix.value, e.changeX, e.changeY);
  });

  const rotate = Gesture.Rotation()
    .onBegin((e) => {
      origin.value = Skia.Point(e.anchorX, e.anchorY);
      offset.value = matrix.value;
    })
    .onChange((e) => {
      matrix.value = rotateZ(offset.value, e.rotation, origin.value);
    });

  const pinch = Gesture.Pinch()
    .onBegin((e) => {
      origin.value = Skia.Point(e.focalX, e.focalY);
      offset.value = matrix.value;
    })
    .onChange((e) => {
      matrix.value = scale(offset.value, e.scale, origin.value);
    });

  const style = useAnimatedStyle(() => {
    return {
      position: "absolute",
      left: x,
      top: y,
      width,
      height,
      backgroundColor: debug ? "rgba(100, 200, 300, 0.4)" : "transparent",
      transform: [
        { translateX: -width / 2 },
        { translateY: -height / 2 },
        {
          matrix: toM4(matrix.value),
        },
        { translateX: width / 2 },
        { translateY: height / 2 },
      ],
    };
  });
  const gesture = Gesture.Race(pinch, rotate, pan);
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={style} />
    </GestureDetector>
  );
};

import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  Canvas,
  Circle,
  Fill,
  useTimestamp,
  useTouchHandler,
  useValue,
  useValueEffect,
} from "@shopify/react-native-skia";

import { AnimationDemo, Size, Padding } from "./Components";

export const AnimationWithTouchHandler = () => {
  const { width } = useWindowDimensions();
  // Timestamp for driving the animation
  const timestamp = useTimestamp();

  // Translate X value for the circle
  const translateX = useValue((width - Size - Padding) / 2);
  // Offset to let us pick up the circle from anywhere
  const offsetX = useValue(0);
  // The circle's velocity
  const circleVelocity = useValue(0);

  // Effect that will listen for updates on the timestamp and
  // calculate the next position of the cicrle
  useValueEffect(timestamp, () => {
    const leftBoundary = Size;
    const rightBoundary = width - Size - Padding;
    let nextValue = translateX.value + circleVelocity.value;
    if (nextValue <= leftBoundary || nextValue >= rightBoundary) {
      // Reverse direction
      circleVelocity.value *= -1;
      nextValue = Math.max(leftBoundary, Math.min(rightBoundary, nextValue));
      // Reduce force on the circle
      circleVelocity.value *= 0.75;
    }
    translateX.value = nextValue;
    circleVelocity.value *= 0.75;
  });

  // Touch handler
  const touchHandler = useTouchHandler({
    onStart: ({ x }) => {
      timestamp.stop();
      offsetX.value = x - translateX.value;
    },
    onActive: ({ x }) => {
      translateX.value = Math.max(
        Size,
        Math.min(width - Size - Padding, x - offsetX.value)
      );
    },
    onEnd: ({ velocityX }) => {
      circleVelocity.value = -(velocityX * 0.015);
      timestamp.start();
    },
  });

  return (
    <AnimationDemo title={"Animation with touch handler."}>
      <Canvas style={styles.canvas} onTouch={touchHandler}>
        <Fill color="white" />
        <Circle cx={translateX} cy={40} r={20} color="#3E3E" />
        <Circle cx={translateX} cy={40} r={15} color="#AEAE" />
      </Canvas>
    </AnimationDemo>
  );
};

const styles = StyleSheet.create({
  canvas: {
    height: 80,
    width: "100%",
    backgroundColor: "#FEFEFE",
  },
});

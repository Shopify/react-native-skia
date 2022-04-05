import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  Canvas,
  Circle,
  Fill,
  useClockValue,
  useTouchHandler,
  useValue,
  useValueEffect,
} from "@shopify/react-native-skia";

import { AnimationDemo, Size, Padding } from "./Components";

export const AnimationWithTouchHandler = () => {
  const { width } = useWindowDimensions();
  // Clock for driving the animation
  const clock = useClockValue();

  // Translate X value for the circle
  const translateX = useValue((width - Size - Padding) / 2);
  // Offset to let us pick up the circle from anywhere
  const offsetX = useValue(0);
  // The circle's velocity
  const circleVelocity = useValue(0);

  // Effect that will listen for updates on the clock and
  // calculate the next position of the circle
  useValueEffect(clock, () => {
    const leftBoundary = Size;
    const rightBoundary = width - Size - Padding;
    let nextValue = translateX.current + circleVelocity.current;
    if (nextValue <= leftBoundary || nextValue >= rightBoundary) {
      // Reverse direction
      circleVelocity.current *= -1;
      nextValue = Math.max(leftBoundary, Math.min(rightBoundary, nextValue));
      // Reduce force on the circle
      circleVelocity.current *= 0.75;
    }
    translateX.current = nextValue;
    circleVelocity.current *= 0.95;

    // Stop clock when we reach threshold
    if (Math.abs(circleVelocity.current) < 0.001) {
      clock.stop();
    }
  });

  // Touch handler
  const touchHandler = useTouchHandler({
    onStart: ({ x }) => {
      clock.stop();
      offsetX.current = x - translateX.current;
    },
    onActive: ({ x }) => {
      translateX.current = Math.max(
        Size,
        Math.min(width - Size - Padding, x - offsetX.current)
      );
    },
    onEnd: ({ velocityX }) => {
      circleVelocity.current = velocityX * 0.05;
      clock.start();
    },
  });

  return (
    <AnimationDemo title={"Bouncing animation with touch handler"}>
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

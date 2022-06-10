import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import type {
  AnimationState,
  SkiaMutableValue,
} from "@shopify/react-native-skia";
import {
  ValueApi,
  Canvas,
  Circle,
  Fill,
  useTouchHandler,
  useValue,
} from "@shopify/react-native-skia";

import { AnimationDemo, Size, Padding } from "./Components";

interface PhysicsAnimationState extends AnimationState {
  velocity: number;
}

const runBouncing = (
  translate: SkiaMutableValue<number>,
  initialVelocity: number,
  leftBoundary: number,
  rightBoundary: number
) => {
  translate.animation = ValueApi.createAnimation<PhysicsAnimationState>(
    (now, state) => {
      if (state === undefined) {
        return {
          current: translate.current,
          velocity: initialVelocity,
          finished: false,
        };
      }
      const velocity = state.velocity * 0.8;
      const newState = {
        current: state.current + velocity * (now / 1000),
        velocity,
        finished: Math.abs(velocity) < 0.001,
      };
      if (
        newState.current <= leftBoundary ||
        newState.current >= rightBoundary
      ) {
        // Reverse direction
        newState.velocity *= -1;
        newState.current = Math.max(
          leftBoundary,
          Math.min(rightBoundary, newState.current)
        );
      }

      // Stop clock when we reach threshold
      if (Math.abs(newState.velocity) < 0.001) {
        return {
          ...newState,
          finished: true,
        };
      }
      return newState;
    }
  );
};

export const AnimationWithTouchHandler = () => {
  const { width } = useWindowDimensions();

  const leftBoundary = Size;
  const rightBoundary = width - Size - Padding;

  // Translate X value for the circle
  const translateX = useValue((width - Size - Padding) / 2);
  // Offset to let us pick up the circle from anywhere
  const offsetX = useValue(0);
  // Touch handler
  const touchHandler = useTouchHandler({
    onStart: ({ x }) => {
      offsetX.current = x - translateX.current;
    },
    onActive: ({ x }) => {
      translateX.current = Math.max(
        Size,
        Math.min(width - Size - Padding, x - offsetX.current)
      );
    },
    onEnd: ({ velocityX }) => {
      runBouncing(translateX, velocityX, leftBoundary, rightBoundary);
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

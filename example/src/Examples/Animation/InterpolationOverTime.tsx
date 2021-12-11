import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import { Canvas, Timing, useValue, useLoop } from "@shopify/react-native-skia";

import { AnimationElement, AnimationDemo, Size, Padding } from "./Components";

const { width } = Dimensions.get("window");

export const InterpolatingValueOverTime = () => {
  const progress = useValue(0);
  useLoop(
    progress,
    Timing.create({
      from: 0,
      to: width - Size,
      durationSeconds: 1,
    }),
    { yoyo: true }
  );
  return (
    <AnimationDemo
      title={"Interpolating value between 0 and width over 1 second."}
    >
      <Canvas style={styles.canvas}>
        <AnimationElement x={() => progress.value} />
      </Canvas>
    </AnimationDemo>
  );
};

const styles = StyleSheet.create({
  canvas: {
    height: 80,
    width: width - Padding,
    backgroundColor: "#FEFEFE",
  },
});

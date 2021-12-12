import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import { Canvas, useLoop } from "@shopify/react-native-skia";
import { createTiming } from "@shopify/react-native-skia/src/animation/Animation/functions";

import { AnimationElement, AnimationDemo, Size, Padding } from "./Components";

const { width } = Dimensions.get("window");

export const InterpolatingValueOverTime = () => {
  const progress = useLoop(
    createTiming({
      from: 0,
      to: width - Size,
      duration: 1000,
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

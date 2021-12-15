import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import { Canvas, Easing, useLoop } from "@shopify/react-native-skia";
import { createTiming } from "@shopify/react-native-skia/src/animation/Animation/functions";

import { AnimationElement, AnimationDemo, Size, Padding } from "./Components";

const { width } = Dimensions.get("window");

export const InterpolationWithEasing = () => {
  const progress = useLoop(
    createTiming({
      from: 10,
      to: width - Size - Padding,
      duration: 1000,
      easing: Easing.inOut(Easing.cubic),
    }),
    { yoyo: true }
  );
  return (
    <AnimationDemo title={"Interpolating value using an easing."}>
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

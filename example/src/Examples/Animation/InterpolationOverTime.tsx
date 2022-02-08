import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import { Canvas, useTiming } from "@shopify/react-native-skia";

import { AnimationElement, AnimationDemo, Size, Padding } from "./Components";

const { width } = Dimensions.get("window");

export const InterpolatingValueOverTime = () => {
  const progress = useTiming(
    {
      from: 0,
      to: width - Size,
      yoyo: true,
    },
    { duration: 1000 }
  );
  return (
    <AnimationDemo
      title={"Interpolating value between 0 and width over 1 second."}
    >
      <Canvas style={styles.canvas}>
        <AnimationElement x={progress} />
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

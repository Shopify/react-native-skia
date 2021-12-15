import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import { Canvas, mix, useProgress } from "@shopify/react-native-skia";

import { AnimationElement, AnimationDemo, Padding } from "./Components";

const { width } = Dimensions.get("window");

export const SimpleValueOverTime = () => {
  const progress = useProgress();
  return (
    <AnimationDemo title={"Simple animation of value over time"}>
      <Canvas style={styles.canvas}>
        <AnimationElement
          x={(ctx) => mix((progress.value / 1000) % 1, 10, ctx.width - 10)}
        />
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
